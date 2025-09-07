import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { hash } from 'bcrypt';
import { UserRole } from 'src/common/user-role.enum';
import { Admin, User } from '@prisma/client';
import { WeddingType } from '../common/wedding-type.enum';
import { BudgetBucket } from '../common/budget-bucket.enum';
import { GuestCountBucket } from '../common/guest-count-bucket.enum';
import { WeddingStyle } from '../common/wedding-style.enum';
import { WeddingService } from '../common/wedding-service.enum';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
    ) { }

    private toAdminResponseDto(admin: Admin & { user: User }): AdminResponseDto {
        const userResponse = this.userService.toUserResponseDto(admin.user);
        return {
            ...userResponse,
            isCouple: admin.isCouple,
            onboardedDate: admin.onboardedDate,
            weddingType: admin.weddingType as WeddingType,
            budgetBucket: admin.budgetBucket as BudgetBucket,
            guestCountBucket: admin.guestCountBucket as GuestCountBucket,
            preferredStyle: admin.preferredStyle as WeddingStyle,
            preferredServices: admin.preferredServices as WeddingService[],
        };
    }

    async findOne(adminId: number): Promise<AdminResponseDto> {
        // Fetch the admin, including the related User
        const admin = await this.prisma.admin.findUnique({
            where: { userId: adminId },
            include: { user: true },
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
            role: 'admin' as UserRole,
        });

        // Create the admin profile
        const admin = await this.prisma.admin.create({
            data: {
                userId: user.id,
                isCouple: dto.isCouple,
                onboardedDate: dto.onboardedDate ? new Date(dto.onboardedDate) : undefined,
                weddingType: dto.weddingType,
                budgetBucket: dto.budgetBucket,
                guestCountBucket: dto.guestCountBucket,
                preferredStyle: dto.preferredStyle,
                preferredServices: dto.preferredServices,
            },
            include: { user: true }, // include the user relation for mapping
        });

        return this.toAdminResponseDto(admin);
    }

    async findAll(): Promise<AdminResponseDto[]> {
        const admins = await this.prisma.admin.findMany({
            include: { user: true },
            orderBy: { onboardedDate: 'desc' },
        });

        return admins.map(admin => this.toAdminResponseDto(admin));
    }


    async findById(userId: number): Promise<AdminResponseDto> {
        const admin = await this.prisma.admin.findUnique({
            where: { userId },
            include: { user: true },
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
            include: { user: true },
        });

        if (!admin) {
            throw new NotFoundException(`Admin with email ${email} not found`);
        }

        return this.toAdminResponseDto(admin);
    }


    async update(userId: number, dto: UpdateAdminDto): Promise<AdminResponseDto> {
        await this.findById(userId);

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

        const updatedAdmin = await this.prisma.admin.update({
            where: { userId },
            data: updateData,
            include: { user: true },
        });

        return this.toAdminResponseDto(updatedAdmin);
    }

    async deleteAdmin(userId: number): Promise<void> {
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
}