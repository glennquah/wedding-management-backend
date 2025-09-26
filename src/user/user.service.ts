import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserRole } from '../common/user-role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target as string[];
        if (target?.includes('email')) {
          throw new ConflictException('User with this email already exists');
        }
        throw new ConflictException(
          'A user with this information already exists',
        );
      }
      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException('User not found');
      }
    }
    throw error;
  }

  toUserResponseDto(user: User & { admin?: { isSuspended: boolean } | null; vendor?: { isSuspended: boolean } | null }): UserResponseDto {
    // Extract isSuspended based on user role
    let isSuspended = false;
    if (user.role === 'ADMIN' && user.admin) {
      isSuspended = user.admin.isSuspended;
    } else if (user.role === 'VENDOR' && user.vendor) {
      isSuspended = user.vendor.isSuspended;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isSuspended,
    };
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // supposed to return UserResponseDto ? check
    try {
      const user = await this.prisma.user.create({ data: dto });
      return this.toUserResponseDto(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.toUserResponseDto(user));
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return this.toUserResponseDto(user);
  }

  async findRawByEmail(email: string): Promise<User & { admin?: { isSuspended: boolean } | null; vendor?: { isSuspended: boolean } | null } | null> {
    // need this for auth service - include admin and vendor to check suspension status
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        admin: {
          select: { isSuspended: true }
        },
        vendor: {
          select: { isSuspended: true }
        }
      }
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findById(id);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: dto,
      });
      return this.toUserResponseDto(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);

    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async createMultiple(users: CreateUserDto[]): Promise<UserResponseDto[]> {
    const createdUsers = await Promise.all(
      users.map((user) => this.create(user)),
    );
    return createdUsers;
  }
}
