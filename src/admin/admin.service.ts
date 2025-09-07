import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { toAdminResponseDto } from './admin.mapper';
import { hash } from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
    ) { }

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
        return toAdminResponseDto(admin);
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
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: await hash(dto.password, 10),
                role: 'admin',
            },
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

        return toAdminResponseDto(admin);
    }

    async findAll(): Promise<AdminResponseDto[]> {
        const admins = await this.prisma.admin.findMany({
            include: { user: true },
            orderBy: { onboardedDate: 'desc' },
        });

        return admins.map(toAdminResponseDto);
    }


    async findById(userId: number): Promise<AdminResponseDto> {
        const admin = await this.prisma.admin.findUnique({
            where: { userId },
            include: { user: true },
        });

        if (!admin) {
            throw new NotFoundException(`Admin with userId ${userId} not found`);
        }

        return toAdminResponseDto(admin);
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

        return toAdminResponseDto(admin);
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

        return toAdminResponseDto(updatedAdmin);
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