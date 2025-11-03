import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin, Prisma, User, Wedding } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { UserRole } from 'src/common/user-role.enum';
import { EmailNotificationService } from 'src/email-notification/email-notification.service';
import { WeddingDetailsDto } from 'src/wedding/dto/wedding-details.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { AdminResponseDto } from './dto/admin-response.dto';
import { CollaboratorResponseDto } from './dto/collaborator-response.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';
import { InvitePartnerDto } from './dto/invite-partner.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private emailService: EmailNotificationService,
    private jwtService: JwtService,
  ) {}

  private toAdminResponseDto(
    admin: Admin & { user: User; weddings?: Wedding[] },
  ): AdminResponseDto {
    const userResponse = this.userService.toUserResponseDto(admin.user);
    return {
      ...userResponse,
      isSuspended: admin.isSuspended,
      onboardedDate: admin.onboardedDate,
      weddings:
        admin.weddings?.map(
          (wedding) =>
            ({
              id: wedding.id,
              name: wedding.name,
            }) satisfies WeddingDetailsDto,
        ) || [],
    };
  }

  async findOne(adminId: number): Promise<AdminResponseDto> {
    // Fetch the admin, including the related User
    const admin = await this.prisma.admin.findUnique({
      where: { userId: adminId },
      include: { user: true, weddings: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with id ${adminId} not found`);
    }

    // Map to DTO
    return this.toAdminResponseDto(admin);
  }

  async create(dto: CreateAdminDto): Promise<AdminResponseDto> {
    // Check if user with the same email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create the user first
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: await hash(dto.password, 10),
      role: UserRole.ADMIN,
    });

    // Create the admin profile first
    const admin = await this.prisma.admin.create({
      data: {
        userId: user.id,
        onboardedDate: new Date(Date.now()),
      },
      include: { user: true, weddings: true },
    });

    // Connect to the wedding via AdminWeddings relation
    if (dto.weddingId) {
      await this.prisma.wedding.update({
        where: { id: dto.weddingId },
        data: {
          admins: {
            connect: { userId: admin.userId },
          },
        },
      });
    }

    // If isCouple is true, also set this admin as the main couple for the wedding
    if (dto.isCouple && dto.weddingId) {
      await this.prisma.wedding.update({
        where: { id: dto.weddingId },
        data: {
          mainCouple: {
            connect: { userId: admin.userId },
          },
        },
      });

      // Also update the admin's mainWeddingId
      await this.prisma.admin.update({
        where: { userId: admin.userId },
        data: {
          mainWeddingId: dto.weddingId,
        },
      });
    }

    // Fetch the updated admin with all relationships
    const updatedAdmin = await this.prisma.admin.findUnique({
      where: { userId: admin.userId },
      include: { user: true, weddings: true },
    });

    // Send Welcome Email (only include weddingId if provided)
    await this.emailService.sendWelcomeEmail(
      user.email,
      user.name,
      process.env.FRONTEND_URL,
      dto.weddingId ?? undefined,
    );

    return this.toAdminResponseDto(updatedAdmin!);
  }

  async findAll(): Promise<AdminResponseDto[]> {
    const admins = await this.prisma.admin.findMany({
      include: { user: true, weddings: true },
      orderBy: { onboardedDate: 'desc' },
    });

    return admins.map((admin) => this.toAdminResponseDto(admin));
  }

  async findById(userId: number): Promise<AdminResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: { user: true, weddings: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    return this.toAdminResponseDto(admin);
  }

  async findByEmail(email: string): Promise<AdminResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const admin = await this.prisma.admin.findUnique({
      where: { userId: user.id },
      include: { user: true, weddings: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with email ${email} not found`);
    }

    return this.toAdminResponseDto(admin);
  }

  async update(userId: number, dto: UpdateAdminDto): Promise<AdminResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
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
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    const updateData: Prisma.AdminUpdateInput = {};
    if (dto.isSuspended !== undefined) updateData.isSuspended = dto.isSuspended;

    // Handle wedding connection separately
    if (dto.weddingId !== undefined) {
      if (dto.weddingId) {
        updateData.weddings = {
          connect: { id: dto.weddingId },
        };
      } else {
        // If weddingId is null, disconnect from weddings
        updateData.weddings = {
          set: [],
        };
      }
    }

    if (dto.isSuspended !== undefined) {
      const email = admin.user.email;
      const name = admin.user.name;
      await this.emailService.sendAdminSuspensionEmail(
        email,
        name,
        dto.isSuspended,
      );
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { userId },
      data: updateData,
      include: { user: true, weddings: true },
    });

    return this.toAdminResponseDto(updatedAdmin);
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
      this.prisma.admin.delete({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async delete(userId: number): Promise<void> {
    await this.findById(userId);

    await this.prisma.$transaction([
      this.prisma.admin.delete({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async createMultiple(admins: CreateAdminDto[]): Promise<AdminResponseDto[]> {
    const createdAdmins = await Promise.all(
      admins.map((admin) => this.create(admin)), // returns AdminResponseDto
    );
    return createdAdmins;
  }

  async getMainWeddingId(
    userId: number,
  ): Promise<{ mainWeddingId: number | null }> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      select: { mainWeddingId: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    return { mainWeddingId: admin.mainWeddingId };
  }

  async getMyWeddings(userId: number): Promise<Wedding[]> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: {
        weddings: {
          include: {
            mainCouple: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    return admin.weddings;
  }

  async setMainWedding(
    userId: number,
    weddingId: number,
  ): Promise<AdminResponseDto> {
    // Check if admin exists
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: { user: true, weddings: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    // Check if wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Link admin to wedding if not already linked
    await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        admins: {
          connect: { userId: userId },
        },
        mainCouple: {
          connect: { userId: userId },
        },
      },
    });

    // Set as main wedding
    const updatedAdmin = await this.prisma.admin.update({
      where: { userId },
      data: {
        mainWeddingId: weddingId,
      },
      include: { user: true, weddings: true },
    });

    return this.toAdminResponseDto(updatedAdmin);
  }

  async inviteCollaborator(
    dto: InviteCollaboratorDto,
    inviterId: number,
  ): Promise<CollaboratorResponseDto> {
    // Check if wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${dto.weddingId} not found`);
    }

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    let userId: number;
    let existingAccount = false;
    const frontendUrl = process.env.FRONTEND_URL || 'https://knotly.app';
    const loginUrl = `${frontendUrl}/login`;

    // Get the inviter's name
    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    const inviterName = inviter?.name || 'Wedding Admin';

    if (existingUser) {
      // User already has an account
      existingAccount = true;
      userId = existingUser.id;

      // Check if they're already an admin
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { userId: existingUser.id },
      });

      if (!existingAdmin) {
        // Create admin profile for existing user
        await this.prisma.admin.create({
          data: {
            userId: existingUser.id,
            onboardedDate: new Date(),
          },
        });
      }

      // Add wedding to their weddings list if not already added
      const adminWithWeddings = await this.prisma.admin.findUnique({
        where: { userId: existingUser.id },
        include: { weddings: true },
      });

      const isAlreadyCollaborator = adminWithWeddings?.weddings.some(
        (w) => w.id === dto.weddingId,
      );

      if (!isAlreadyCollaborator) {
        await this.prisma.wedding.update({
          where: { id: dto.weddingId },
          data: {
            admins: {
              connect: { userId: existingUser.id },
            },
          },
        });
      }

      // Send email to existing account
      await this.emailService.sendCollaboratorAddedEmail(
        dto.email,
        dto.name,
        wedding.name,
        inviterName,
        loginUrl,
        dto.weddingId,
        false, // isPartner
      );
    } else {
      // Create new user and admin account
      // Generate a temporary password (will be changed via password reset)
      const tempPassword = Math.random().toString(36).slice(-8);

      const newUser = await this.userService.create({
        name: dto.name,
        email: dto.email,
        password: await hash(tempPassword, 10),
        role: UserRole.ADMIN,
      });

      userId = newUser.id;

      // Create admin profile
      await this.prisma.admin.create({
        data: {
          userId: newUser.id,
          onboardedDate: new Date(),
        },
      });

      // Add wedding to their weddings list
      await this.prisma.wedding.update({
        where: { id: dto.weddingId },
        data: {
          admins: {
            connect: { userId: newUser.id },
          },
        },
      });

      // Generate password reset token (7 days for collaborator invites)
      const token = await this.jwtService.signAsync(
        {
          sub: newUser.id,
          email: newUser.email,
        },
        {
          expiresIn: '7d',
          secret: process.env.JWT_SECRET_KEY,
        },
      );

      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      // Send create account email with password reset link
      await this.emailService.sendCreateAccountEmail(
        dto.email,
        resetLink,
        dto.name,
        wedding.name,
        inviterName,
        dto.weddingId,
        false, // isPartner
      );
    }

    // Return response
    return {
      id: userId,
      name: dto.name,
      email: dto.email,
      accountCreated: !existingAccount,
      existingAccount,
    };
  }

  async getCollaborators(weddingId: number): Promise<AdminResponseDto[]> {
    // Get all admins associated with this wedding
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        admins: {
          include: {
            user: true,
            weddings: true,
          },
        },
        mainCouple: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Filter out main couple(s) to return only collaborators
    const mainCoupleIds = wedding.mainCouple.map((mc) => mc.userId);
    const collaborators = wedding.admins.filter(
      (admin) => !mainCoupleIds.includes(admin.userId),
    );

    return collaborators.map((admin) => this.toAdminResponseDto(admin));
  }

  async removeCollaborator(weddingId: number, userId: number): Promise<void> {
    // Check if wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        mainCouple: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Check if trying to remove main couple
    const isMainCouple = wedding.mainCouple.some((mc) => mc.userId === userId);
    if (isMainCouple) {
      throw new ConflictException('Cannot remove main couple as collaborator');
    }

    // Remove wedding from admin's weddings list
    await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        admins: {
          disconnect: { userId },
        },
      },
    });
  }

  async invitePartner(
    dto: InvitePartnerDto,
    inviterId: number,
  ): Promise<CollaboratorResponseDto> {
    // Check if wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
      include: {
        mainCouple: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${dto.weddingId} not found`);
    }

    // Check if main couple already has 2 members
    if (wedding.mainCouple.length >= 2) {
      throw new ConflictException('Main couple already has 2 members');
    }

    // If guestId provided, check if guest exists
    if (dto.guestId) {
      const guest = await this.prisma.guest.findUnique({
        where: { id: dto.guestId },
      });

      if (!guest) {
        throw new NotFoundException(`Guest with id ${dto.guestId} not found`);
      }
    }

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    let userId: number;
    let existingAccount = false;
    const frontendUrl = process.env.FRONTEND_URL || 'https://knotly.app';
    const loginUrl = `${frontendUrl}/login`;

    // Get the inviter's name
    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    const inviterName = inviter?.name || 'Wedding Admin';

    if (existingUser) {
      // User already has an account
      existingAccount = true;
      userId = existingUser.id;

      // Check if they're already an admin
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { userId: existingUser.id },
      });

      if (!existingAdmin) {
        // Create admin profile for existing user
        await this.prisma.admin.create({
          data: {
            userId: existingUser.id,
            onboardedDate: new Date(),
          },
        });
      }

      // Add to main couple and set as their main wedding
      await this.prisma.wedding.update({
        where: { id: dto.weddingId },
        data: {
          mainCouple: {
            connect: { userId: existingUser.id },
          },
          admins: {
            connect: { userId: existingUser.id },
          },
        },
      });

      // Send email to existing account
      await this.emailService.sendCollaboratorAddedEmail(
        dto.email,
        dto.name,
        wedding.name,
        inviterName,
        loginUrl,
        dto.weddingId,
        true, // isPartner
      );
    } else {
      // Create new user and admin account
      // Generate a temporary password (will be changed via password reset)
      const tempPassword = Math.random().toString(36).slice(-8);

      const newUser = await this.userService.create({
        name: dto.name,
        email: dto.email,
        password: await hash(tempPassword, 10),
        role: UserRole.ADMIN,
      });

      userId = newUser.id;

      // Create admin profile
      await this.prisma.admin.create({
        data: {
          userId: newUser.id,
          onboardedDate: new Date(),
        },
      });

      // Add to main couple and weddings list
      await this.prisma.wedding.update({
        where: { id: dto.weddingId },
        data: {
          mainCouple: {
            connect: { userId: newUser.id },
          },
          admins: {
            connect: { userId: newUser.id },
          },
        },
      });

      // Generate password reset token (7 days for partner invites)
      const token = await this.jwtService.signAsync(
        {
          sub: newUser.id,
          email: newUser.email,
        },
        {
          expiresIn: '7d',
          secret: process.env.JWT_SECRET_KEY,
        },
      );

      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      // Send create account email with password reset link
      await this.emailService.sendCreateAccountEmail(
        dto.email,
        resetLink,
        dto.name,
        wedding.name,
        inviterName,
        dto.weddingId,
        true, // isPartner
      );
    }

    // Fetch and return the created partner
    const partner = await this.findById(userId);

    return {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      accountCreated: true,
      existingAccount,
    };
  }

  async removePartner(weddingId: number, userId: number): Promise<void> {
    // Check if wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        mainCouple: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Check if user is in main couple
    const isInMainCouple = wedding.mainCouple.some(
      (mc) => mc.userId === userId,
    );
    if (!isInMainCouple) {
      throw new NotFoundException('User is not in main couple');
    }

    // Remove from main couple and admins
    await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        mainCouple: {
          disconnect: { userId },
        },
        admins: {
          disconnect: { userId },
        },
      },
    });
  }
}
