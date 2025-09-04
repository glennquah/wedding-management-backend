import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from '@prisma/client';
import { UserService } from '../user/user.service';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}

  async create(dto: CreateVendorDto): Promise<Vendor> {
    // Check if vendor with the same email already exists
    const existingVendor = await this.prisma.vendor.findUnique({
      where: { email: dto.email },
    });
    if (existingVendor) {
      throw new ConflictException('Vendor with this email already exists');
    }

    return this.prisma.vendor.create({
        data: {
          ...dto,
          role: dto.role || 'vendor',
          onboardedDate: dto.onboardedDate ? new Date(dto.onboardedDate) : new Date(),
        },
      });
    }

  async findAll(): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
    });
    
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    
    return vendor;
  }

  async findByEmail(email: string): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { email },
    });
    
    if (!vendor) {
      throw new NotFoundException(`Vendor with email ${email} not found`);
    }
    
    return vendor;
  }

  async update(id: number, dto: UpdateVendorDto): Promise<Vendor> {
    await this.findById(id);
    
    // Check if vendor with the same email already exists
    const existingVendor = await this.prisma.vendor.findUnique({
      where: { email: dto.email },
    });
    if (existingVendor) {
      throw new ConflictException('Vendor with this email already exists');
    }

    const updateData: any = { ...dto };
    if (dto.onboardedDate) {
      updateData.onboardedDate = new Date(dto.onboardedDate);
    }

    return this.prisma.vendor.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    
    await this.prisma.vendor.delete({
      where: { id },
    });
  }

  async createMultiple(vendors: CreateVendorDto[]): Promise<Vendor[]> {
    const createdVendors = await Promise.all(
      vendors.map(vendor => this.create(vendor))
    );
    return createdVendors;
  }
}
