import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Admin, Prisma, User, Wedding } from '@prisma/client';
import { hash } from 'bcrypt';
import { UserRole } from 'src/common/user-role.enum';
import { WeddingDetailsDto } from 'src/wedding/dto/wedding-details.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { AdminResponseDto } from './dto/admin-response.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  private toAdminResponseDto(
    admin: Admin & { user: User; weddings?: Wedding[] },
  ): AdminResponseDto {
    const userResponse = this.userService.toUserResponseDto(admin.user);
    return {
      ...userResponse,
      isSuspended: admin.isSuspended,
      onboardedDate: admin.onboardedDate,
      weddings:
        admin.weddings?.map(
          (wedding) =>
            ({
              id: wedding.id,
              name: wedding.name,
            }) satisfies WeddingDetailsDto,
        ) || [],
    };
  }

  async findOne(adminId: number): Promise<AdminResponseDto> {
    // Fetch the admin, including the related User
    const admin = await this.prisma.admin.findUnique({
      where: { userId: adminId },
      include: { user: true, weddings: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with id ${adminId} not found`);
    }

    // Map to DTO
    return this.toAdminResponseDto(admin);
  }

  async create(dto: CreateAdminDto): Promise<AdminResponseDto> {
    // Check if user with the same email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create the user first
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: await hash(dto.password, 10),
      role: 'admin' as UserRole,
    });

    // Create the admin profile first
    const admin = await this.prisma.admin.create({
      data: {
        userId: user.id,
        onboardedDate: dto.onboardedDate
          ? new Date(dto.onboardedDate)
          : undefined,
      },
      include: { user: true, weddings: true },
    });

    // Connect to the wedding via AdminWeddings relation
    if (dto.weddingId) {
      await this.prisma.wedding.update({
        where: { id: dto.weddingId },
        data: {
          admins: {
            connect: { userId: admin.userId },
          },
        },
      });
    }

    // If isCouple is true, also set this admin as the main couple for the wedding
    if (dto.isCouple && dto.weddingId) {
      await this.prisma.wedding.update({
        where: { id: dto.weddingId },
        data: {
          mainCouple: {
            connect: { userId: admin.userId },
          },
        },
      });

      // Also update the admin's mainWeddingId
      await this.prisma.admin.update({
        where: { userId: admin.userId },
        data: {
          mainWeddingId: dto.weddingId,
        },
      });
    }

    // Fetch the updated admin with all relationships
    const updatedAdmin = await this.prisma.admin.findUnique({
      where: { userId: admin.userId },
      include: { user: true, weddings: true },
    });

    return this.toAdminResponseDto(updatedAdmin!);
  }

  async findAll(): Promise<AdminResponseDto[]> {
    const admins = await this.prisma.admin.findMany({
      include: { user: true, weddings: true },
      orderBy: { onboardedDate: 'desc' },
    });

    return admins.map((admin) => this.toAdminResponseDto(admin));
  }

  async findById(userId: number): Promise<AdminResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: { user: true, weddings: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    return this.toAdminResponseDto(admin);
  }

  async findByEmail(email: string): Promise<AdminResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const admin = await this.prisma.admin.findUnique({
      where: { userId: user.id },
      include: { user: true, weddings: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with email ${email} not found`);
    }

    return this.toAdminResponseDto(admin);
  }

  async update(userId: number, dto: UpdateAdminDto): Promise<AdminResponseDto> {
    await this.findById(userId);

    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('User with this email already exists');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: dto.email,
          name: dto.name,
          password: dto.password,
        },
      });
    } else if (dto.name || dto.password) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: dto.name,
          password: dto.password,
        },
      });
    }

    const updateData: Prisma.AdminUpdateInput = {};
    if (dto.isSuspended !== undefined) updateData.isSuspended = dto.isSuspended;
    if (dto.onboardedDate) {
      updateData.onboardedDate = new Date(dto.onboardedDate);
    }

    // Handle wedding connection separately
    if (dto.weddingId !== undefined) {
      if (dto.weddingId) {
        updateData.weddings = {
          connect: { id: dto.weddingId },
        };
      } else {
        // If weddingId is null, disconnect from weddings
        updateData.weddings = {
          set: [],
        };
      }
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { userId },
      data: updateData,
      include: { user: true, weddings: true },
    });

    return this.toAdminResponseDto(updatedAdmin);
  }

  async deleteAdmin(userId: number): Promise<void> {
    await this.findById(userId);

    await this.prisma.$transaction([
      this.prisma.admin.delete({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async createMultiple(admins: CreateAdminDto[]): Promise<AdminResponseDto[]> {
    const createdAdmins = await Promise.all(
      admins.map((admin) => this.create(admin)), // returns AdminResponseDto
    );
    return createdAdmins;
  }
}
