import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target as string[];
        if (target?.includes('email')) {
          throw new ConflictException('User with this email already exists');
        }
        throw new ConflictException('A user with this information already exists');
      }
      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException('User not found');
      }
    }
    throw error;
  }

  async createUser(dto: CreateUserDto): Promise<User> { // supposed to return UserResponseDto ? check
    try {
      return await this.prisma.user.create({ data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    await this.findUserById(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async delete(id: number): Promise<void> {
    await this.findUserById(id);

    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async createMultipleUsers(users: CreateUserDto[]): Promise<User[]> {
    const createdUsers = await Promise.all(
      users.map(user => this.createUser(user))
    );
    return createdUsers;
  }
}
