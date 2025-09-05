import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { Wedding } from '@prisma/client';

@Injectable()
export class WeddingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWeddingDto): Promise<Wedding> {
    return this.prisma.wedding.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        location: dto.location,
      },
    });
  }

  async findAll(): Promise<Wedding[]> {
    return this.prisma.wedding.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Wedding> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id },
      include: {
        guests: true,
      },
    });
    
    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${id} not found`);
    }
    
    return wedding;
  }

  async update(id: number, dto: UpdateWeddingDto): Promise<Wedding> {
    await this.findById(id);
    
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.date !== undefined) updateData.date = new Date(dto.date);
    if (dto.location !== undefined) updateData.location = dto.location;
    
    return this.prisma.wedding.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    
    await this.prisma.wedding.delete({
      where: { id },
    });
  }
}