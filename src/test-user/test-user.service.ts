import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestUserDto } from './dto/create-test-user.dto';
import { TestUserResponseDto } from './dto/test-user-response.dto';
import { hash } from 'bcrypt'; 

@Injectable()
export class TestUserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTestUserDto): Promise<TestUserResponseDto> {
    const user = await this.prisma.testUser.findUnique({
      where: {
        email: dto.email,
      }
    });

    if (user) throw new ConflictException('Email duplicated');
    
    const newUser = await this.prisma.testUser.create({
      data: {
        ...dto,
        password: await hash(dto.password, 10),
      },
    });

    const {password: _password, ...result } = newUser;
    return result;
  }

  async findByEmail(email: string) {
    return await this.prisma.testUser.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findById(id: number) {
    return await this.prisma.testUser.findUnique({
      where: {
        id: id,
      },
    });
  }
}
