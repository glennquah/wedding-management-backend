import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from '@prisma/client';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { toVendorResponseDto } from './vendor.mapper';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findOneVendor(vendorId: number): Promise<VendorResponseDto> {
    // Fetch the vendor, including the related User
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
      include: { user: true }, 
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with id ${vendorId} not found`);
    }

    // Map to DTO
    return toVendorResponseDto(vendor);
  }

  async createVendor(dto: CreateVendorDto): Promise<VendorResponseDto> {
    // Check if user with the same email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create the user first
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: 'vendor',
      },
    });

    // Create the vendor profile
    const vendor = await this.prisma.vendor.create({
      data: {
        userId: user.id,
        vendorWebsite: dto.vendorWebsite,
        uenNumber: dto.uenNumber,
        onboardedDate: dto.onboardedDate ? new Date(dto.onboardedDate) : undefined,
        bio: dto.bio,
        rating: dto.rating,
        serviceOffered: dto.serviceOffered,
        styleOffered: dto.styleOffered,
        weddingTypes: dto.weddingTypes,
        capacity: dto.capacity,
      },
      include: { user: true }, // include the user relation for mapping
    });

    return toVendorResponseDto(vendor);
  }

  async findAllVendors(): Promise<VendorResponseDto[]> {
    const vendors = await this.prisma.vendor.findMany({
      include: { user: true },
      orderBy: { onboardedDate: 'desc' },
    });

    return vendors.map(toVendorResponseDto);
  }

  async findVendorById(userId: number): Promise<VendorResponseDto> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    return toVendorResponseDto(vendor);
  }

  async findVendorByEmail(email: string): Promise<VendorResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with email ${email} not found`);
    }

    return toVendorResponseDto(vendor);
  }


  async updateVendor(userId: number, dto: UpdateVendorDto): Promise<VendorResponseDto> {
    await this.findVendorById(userId);

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

    const updateData: any = { ...dto };
    if (dto.onboardedDate) {
      updateData.onboardedDate = new Date(dto.onboardedDate);
    }
    // Remove user fields from updateData
    delete updateData.email;
    delete updateData.name;
    delete updateData.password;
    delete updateData.role;

    const updatedVendor = this.prisma.vendor.update({
      where: { userId },
      data: updateData,
      include: { user: true },
    });

    return toVendorResponseDto(await updatedVendor);
  }

  async deleteVendor(userId: number): Promise<void> {
    await this.findVendorById(userId);

    await this.prisma.$transaction([
      this.prisma.vendor.delete({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async createMultiple(vendors: CreateVendorDto[]): Promise<VendorResponseDto[]> {
    const createdVendors = await Promise.all(
      vendors.map((vendor) => this.createVendor(vendor)), // returns VendorResponseDto
    );
    return createdVendors;
  }
}
