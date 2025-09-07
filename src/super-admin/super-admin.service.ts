import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { SuperAdminResponseDto } from './dto/super-admin-response.dto';
import { hash } from 'bcrypt';
import { UserRole } from 'src/common/user-role.enum';

@Injectable()
export class SuperAdminService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
    ) { }

    async findOne(superAdminId: number): Promise<SuperAdminResponseDto> {
        const superAdmin = await this.prisma.superAdmin.findUnique({
            where: { userId: superAdminId },
            include: { user: true },
        });

        if (!superAdmin) {
            throw new NotFoundException(`Super Admin with id ${superAdminId} not found`);
        }

        return this.userService.toUserResponseDto(superAdmin.user);
    }

    async create(dto: { name: string; email: string; password: string }): Promise<SuperAdminResponseDto> {
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
            role: 'superAdmin' as UserRole,
        });

        // Create the super admin profile
        const superAdmin = await this.prisma.superAdmin.create({
            data: {
                userId: user.id,
            },
            include: { user: true },
        });

        return this.userService.toUserResponseDto(superAdmin.user);
    }

    async findAll(): Promise<SuperAdminResponseDto[]> {
        const superAdmins = await this.prisma.superAdmin.findMany({
            include: { user: true },
        });

        return superAdmins.map(sa => this.userService.toUserResponseDto(sa.user));
    }

    async findById(userId: number): Promise<SuperAdminResponseDto> {
        const superAdmin = await this.prisma.superAdmin.findUnique({
            where: { userId },
            include: { user: true },
        });

        if (!superAdmin) {
            throw new NotFoundException(`Super Admin with userId ${userId} not found`);
        }

        return this.userService.toUserResponseDto(superAdmin.user);
    }

    async findByEmail(email: string): Promise<SuperAdminResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        const superAdmin = await this.prisma.superAdmin.findUnique({
            where: { userId: user.id },
            include: { user: true },
        });

        if (!superAdmin) {
            throw new NotFoundException(`Super Admin with email ${email} not found`);
        }

        return this.userService.toUserResponseDto(superAdmin.user);
    }

    async update(userId: number, dto: { name?: string; email?: string; password?: string }): Promise<SuperAdminResponseDto> {
        const superAdmin = await this.prisma.superAdmin.findUnique({
            where: { userId },
            include: { user: true },
        });

        if (!superAdmin) {
            throw new NotFoundException(`Super Admin with userId ${userId} not found`);
        }

        if (dto.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingUser && existingUser.id !== userId) {
                throw new ConflictException('User with this email already exists');
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                email: dto.email,
                name: dto.name,
                password: dto.password,
            },
        });

        return this.userService.toUserResponseDto(updatedUser);
    }

    async delete(userId: number): Promise<void> {
        const superAdmin = await this.prisma.superAdmin.findUnique({
            where: { userId },
        });

        if (!superAdmin) {
            throw new NotFoundException(`Super Admin with userId ${userId} not found`);
        }

        await this.prisma.$transaction([
            this.prisma.superAdmin.delete({ where: { userId } }),
            this.prisma.user.delete({ where: { id: userId } }),
        ]);
    }

    async createMultiple(superAdmins: { name: string; email: string; password: string }[]): Promise<SuperAdminResponseDto[]> {
        const createdSuperAdmins = await Promise.all(
            superAdmins.map((dto) => this.create(dto)),
        );
        return createdSuperAdmins;
    }
}