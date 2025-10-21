import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, Vendor } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { UserRole } from 'src/common/user-role.enum';
import { VendorOnboardingStatus } from 'src/common/vendor-onboarding-status.enum';
import { EmailNotificationService } from 'src/email-notification/email-notification.service';
import { WeddingService } from '../common/wedding-service.enum';
import { WeddingStyle } from '../common/wedding-style.enum';
import { WeddingType } from '../common/wedding-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { StripeConnectAccountResponseDto } from './dto/stripe-connect.dto';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private emailService: EmailNotificationService,
  ) {}

  private toVendorResponseDto(
    vendor: Vendor & { user: User },
  ): VendorResponseDto {
    const userResponse = this.userService.toUserResponseDto(vendor.user);
    return {
      ...userResponse,
      vendorWebsite: vendor.vendorWebsite,
      uenNumber: vendor.uenNumber,
      onboardedDate: vendor.onboardedDate,
      bio: vendor.bio,
      rating: vendor.rating,
      serviceOffered: vendor.serviceOffered as WeddingService,
      styleOffered: vendor.styleOffered as WeddingStyle,
      weddingTypes: vendor.weddingTypes as WeddingType[],
      capacity: vendor.capacity,
      onboardingStatus: vendor.onboardingStatus as VendorOnboardingStatus,
      isSuspended: vendor.isSuspended,
    };
  }

  async findOne(vendorId: number): Promise<VendorResponseDto> {
    // Fetch the vendor, including the related User
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
      include: { user: true },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with id ${vendorId} not found`);
    }

    // Map to DTO
    return this.toVendorResponseDto(vendor);
  }

  async create(dto: CreateVendorDto): Promise<VendorResponseDto> {
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
        password: await hash(dto.password, 10),
        role: UserRole.VENDOR,
      },
    });

    // Create the vendor profile
    const vendor = await this.prisma.vendor.create({
      data: {
        userId: user.id,
        vendorWebsite: dto.vendorWebsite,
        uenNumber: dto.uenNumber,
        onboardedDate: dto.onboardedDate
          ? new Date(dto.onboardedDate)
          : undefined,
        bio: dto.bio,
        rating: dto.rating,
        serviceOffered: dto.serviceOffered,
        styleOffered: dto.styleOffered,
        weddingTypes: dto.weddingTypes,
        capacity: dto.capacity,
        notificationDetails: {
          create: {},
        },
      },
      include: { user: true }, // include the user relation for mapping
    });

    // Send vendor status email for new vendor account (PENDING by default)
    await this.emailService.sendVendorStatusEmail(
      user.email,
      user.name,
      VendorOnboardingStatus.PENDING,
      user.id,
    );

    return this.toVendorResponseDto(vendor);
  }

  async findAll(): Promise<VendorResponseDto[]> {
    const vendors = await this.prisma.vendor.findMany({
      include: { user: true },
      orderBy: { onboardedDate: 'desc' },
    });

    return vendors.map((vendor) => this.toVendorResponseDto(vendor));
  }

  async findById(userId: number): Promise<VendorResponseDto> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    return this.toVendorResponseDto(vendor);
  }

  async findByEmail(email: string): Promise<VendorResponseDto> {
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

    return this.toVendorResponseDto(vendor);
  }

  async update(
    userId: number,
    dto: UpdateVendorDto,
  ): Promise<VendorResponseDto> {
    await this.findById(userId);

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
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
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

    const updatedVendor = await this.prisma.vendor.update({
      where: { userId },
      data: updateData,
      include: { user: true },
    });

    // Send onboarding status change email
    const vendorName = updatedVendor.user.name;
    const vendorEmail = updatedVendor.user.email;
    if (dto.onboardingStatus) {
      await this.emailService.sendVendorStatusEmail(
        vendorEmail,
        vendorName,
        dto.onboardingStatus,
        userId,
      );
    }

    // Send suspension status change email
    if (dto.isSuspended !== undefined) {
      await this.emailService.sendVendorSuspensionEmail(
        vendorEmail,
        vendorName,
        dto.isSuspended,
        userId,
      );
    }

    return this.toVendorResponseDto(updatedVendor);
  }

  async deleteSelf(userId: number, password: string): Promise<void> {
    // Get the raw user data with password for validation
    const rawUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!rawUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Validate password
    const isValidPassword = await compare(password, rawUser.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.prisma.$transaction([
      this.prisma.vendor.delete({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async delete(userId: number): Promise<void> {
    await this.findById(userId);

    await this.prisma.$transaction([
      this.prisma.vendor.delete({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async createMultiple(
    vendors: CreateVendorDto[],
  ): Promise<VendorResponseDto[]> {
    const createdVendors = await Promise.all(
      vendors.map((vendor) => this.create(vendor)), // returns VendorResponseDto
    );
    return createdVendors;
  }

  async getStripeAccountInfo(userId: number) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with userId ${userId} not found`);
    }

    return {
      stripeConnectAccountId: vendor.stripeConnectAccountId,
      stripeAccountOnboardingComplete: vendor.stripeAccountOnboardingComplete,
      stripeChargesEnabled: vendor.stripeChargesEnabled,
      stripePayoutsEnabled: vendor.stripePayoutsEnabled,
      stripeDetailsSubmitted: vendor.stripeDetailsSubmitted,
    };
  }

  async acceptVendorWithStripe(
    userId: number,
    paymentService: any,
  ): Promise<{
    vendor: VendorResponseDto;
    stripeAccount: StripeConnectAccountResponseDto;
  }> {
    // Get vendor details first
    const vendor = await this.findById(userId);

    // Update onboarding status to ONBOARDED
    const updatedVendor = await this.update(userId, {
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    });

    // Create Stripe Connect account or generate new onboarding link
    const stripeAccountInfo = await this.getStripeAccountInfo(userId);
    let stripeAccount: StripeConnectAccountResponseDto;

    if (!stripeAccountInfo.stripeConnectAccountId) {
      // Create new Stripe Connect account
      stripeAccount = await paymentService.createConnectAccount(
        vendor.email,
        userId,
      );
    } else {
      // Generate new onboarding link for existing account
      const accountLink = await paymentService.createAccountLink(
        stripeAccountInfo.stripeConnectAccountId,
      );
      stripeAccount = {
        accountId: stripeAccountInfo.stripeConnectAccountId,
        accountLinkUrl: accountLink.url,
        expiresAt: new Date(accountLink.expires_at * 1000).toISOString(),
      };
    }

    return {
      vendor: updatedVendor,
      stripeAccount,
    };
  }
}
