import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { UserRole } from 'src/common/user-role.enum';
import { EmailNotificationService } from 'src/email-notification/email-notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { SuperAdminResponseDto } from './dto/super-admin-response.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailNotificationService,
  ) {}

  async findOne(superAdminId: number): Promise<SuperAdminResponseDto> {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { userId: superAdminId },
      include: { user: true },
    });

    if (!superAdmin) {
      throw new NotFoundException(
        `Super Admin with id ${superAdminId} not found`,
      );
    }

    return this.userService.toUserResponseDto(superAdmin.user);
  }

  async create(dto: {
    name: string;
    email: string;
    password?: string;
  }): Promise<SuperAdminResponseDto> {
    // Check if user with the same email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Use provided password or generate a temporary one
    const password = dto.password || Math.random().toString(36).slice(-8);

    // Create the user first
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: await hash(password, 10),
      role: UserRole.SUPERADMIN,
    });

    // Create the super admin profile
    const superAdmin = await this.prisma.superAdmin.create({
      data: {
        userId: user.id,
      },
      include: { user: true },
    });

    // Only send password reset email if no password was provided (production flow)
    if (!dto.password) {
      // Generate password reset token (7 days)
      const token = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          expiresIn: '7d',
          secret: process.env.JWT_SECRET_KEY,
        },
      );

      // Construct URLs for the email
      const frontendUrl =
        process.env.ADMIN_FRONTEND_URL || 'https://internal.knotly.app';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      // Send password reset email
      await this.emailService.sendSuperAdminCreatedEmail(
        dto.email,
        dto.name,
        resetLink,
        frontendUrl,
      );
    }

    return this.userService.toUserResponseDto(superAdmin.user);
  }

  async findAll(): Promise<SuperAdminResponseDto[]> {
    const superAdmins = await this.prisma.superAdmin.findMany({
      include: { user: true },
    });

    return superAdmins.map((sa) => this.userService.toUserResponseDto(sa.user));
  }

  async findById(userId: number): Promise<SuperAdminResponseDto> {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!superAdmin) {
      throw new NotFoundException(
        `Super Admin with userId ${userId} not found`,
      );
    }

    return this.userService.toUserResponseDto(superAdmin.user);
  }

  async findByEmail(email: string): Promise<SuperAdminResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!superAdmin) {
      throw new NotFoundException(`Super Admin with email ${email} not found`);
    }

    return this.userService.toUserResponseDto(superAdmin.user);
  }

  async update(
    userId: number,
    dto: { name?: string; email?: string; password?: string },
  ): Promise<SuperAdminResponseDto> {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!superAdmin) {
      throw new NotFoundException(
        `Super Admin with userId ${userId} not found`,
      );
    }

    // Prepare user update data
    const userUpdateData: any = {};
    if (dto.name) userUpdateData.name = dto.name;
    if (dto.email) userUpdateData.email = dto.email;
    if (dto.password) userUpdateData.password = await hash(dto.password, 10);

    // Check if email is being updated and if it conflicts
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Update user data if there are changes
    if (Object.keys(userUpdateData).length > 0) {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
      return this.userService.toUserResponseDto(updatedUser);
    }

    return this.userService.toUserResponseDto(superAdmin.user);
  }

  async delete(userId: number): Promise<void> {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { userId },
    });

    if (!superAdmin) {
      throw new NotFoundException(
        `Super Admin with userId ${userId} not found`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.superAdmin.delete({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async createMultiple(
    superAdmins: { name: string; email: string; password?: string }[],
  ): Promise<SuperAdminResponseDto[]> {
    const createdSuperAdmins = await Promise.all(
      superAdmins.map((dto) => this.create(dto)),
    );
    return createdSuperAdmins;
  }
}
