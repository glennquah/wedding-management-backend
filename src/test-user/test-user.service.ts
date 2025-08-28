import { Injectable } from '@nestjs/common';
import { TestUser } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestUserDto } from './dto/create-test-user.dto';

@Injectable()
export class TestUserService {
  constructor(private prisma: PrismaService) {}

  async create(payload: CreateTestUserDto): Promise<TestUser> {
    return this.prisma.testUser.create({
      data: { ...payload },
    });
  }
}
