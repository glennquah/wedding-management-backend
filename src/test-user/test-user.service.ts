import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestUserDto } from './dto/create-test-user.dto';
import { hash } from 'bcrypt';
import { TestUser } from '@prisma/client';

@Injectable()
export class TestUserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTestUserDto): Promise<TestUser> {
    const user = await this.prisma.testUser.findUnique({
      where: { email: dto.email },
    });

    if (user) throw new ConflictException('Email duplicated');

    return this.prisma.testUser.create({
      data: {
        ...dto,
        password: await hash(dto.password, 10),
      },
    });
  }

  async findByEmail(email: string): Promise<TestUser> {
    const user = await this.prisma.testUser.findUnique({ where: { email } });
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  async findById(id: number): Promise<TestUser> {
    const user = await this.prisma.testUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
}
