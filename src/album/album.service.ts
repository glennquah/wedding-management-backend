import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Album } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AlbumResponseDto } from './dto/album-response.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumService {
  constructor(private prisma: PrismaService) {}

  private toAlbumResponseDto(album: Album): AlbumResponseDto {
    return {
      id: album.id,
      weddingId: album.weddingId,
      coupleName: album.coupleName,
      inviteCardMessage: album.inviteCardMessage,
      landingMessage: album.landingMessage,
      albumURL: album.albumURL,
      photos: album.photos,
    };
  }

  async getAlbumByWeddingId(weddingId: number): Promise<AlbumResponseDto> {
    const album = await this.prisma.album.findUnique({
      where: { weddingId },
      include: { wedding: true },
    });

    if (!album) {
      throw new NotFoundException(
        `Album for wedding ID ${weddingId} not found`,
      );
    }

    return this.toAlbumResponseDto(album);
  }

  async getAlbumByAlbumId(albumId: number): Promise<AlbumResponseDto> {
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
      include: { wedding: true },
    });

    return this.toAlbumResponseDto(album);
  }

  async createAlbum(
    userId: number,
    createAlbumDto: CreateAlbumDto,
  ): Promise<AlbumResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: { weddings: { where: { id: createAlbumDto.weddingId } } },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    if (admin.weddings.length === 0) {
      throw new ForbiddenException(
        `Wedding with ID ${createAlbumDto.weddingId} not found or not owned by admin`,
      );
    }

    const existingAlbumForWedding = await this.prisma.album.findUnique({
      where: { weddingId: createAlbumDto.weddingId },
    });

    if (existingAlbumForWedding) {
      throw new ConflictException(
        `Wedding with ID ${createAlbumDto.weddingId} already has an album`,
      );
    }

    const album = await this.prisma.album.create({
      data: {
        coupleName: createAlbumDto.coupleName,
        inviteCardMessage: createAlbumDto.inviteCardMessage,
        landingMessage: createAlbumDto.landingMessage,
        weddingId: createAlbumDto.weddingId,
        albumURL: createAlbumDto.albumURL,
        photos: [],
      },
      include: { wedding: true },
    });

    return this.toAlbumResponseDto(album);
  }

  async updateAlbum(
    userId: number,
    albumId: number,
    updateAlbumDto: UpdateAlbumDto,
  ): Promise<AlbumResponseDto> {
    const existingAlbum = await this.prisma.album.findUnique({
      where: { id: albumId },
      include: {
        wedding: { include: { admins: { where: { userId } } } },
      },
    });

    if (!existingAlbum) {
      throw new NotFoundException(`Album with ID ${albumId} not found`);
    }

    if (existingAlbum.wedding.admins.length === 0) {
      throw new ForbiddenException(`You do not have access to this album`);
    }

    const updatedAlbum = await this.prisma.album.update({
      where: { id: albumId },
      data: {
        coupleName: updateAlbumDto.coupleName,
        inviteCardMessage: updateAlbumDto.inviteCardMessage,
        landingMessage: updateAlbumDto.landingMessage,
        albumURL: updateAlbumDto.albumURL,
      },
      include: { wedding: true },
    });

    return this.toAlbumResponseDto(updatedAlbum);
  }

  async addPhoto(albumId: number, photoUrl: string): Promise<AlbumResponseDto> {
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${albumId} not found`);
    }

    const updatedPhotos = album.photos
      ? [...album.photos, photoUrl]
      : [photoUrl];

    const updatedAlbum = await this.prisma.album.update({
      where: { id: albumId },
      data: { photos: updatedPhotos },
    });

    return this.toAlbumResponseDto(updatedAlbum);
  }

  async deleteAlbum(
    userId: number,
    albumId: number,
  ): Promise<{ message: string }> {
    const existingAlbum = await this.prisma.album.findUnique({
      where: { id: albumId },
      include: {
        wedding: { include: { admins: { where: { userId } } } },
      },
    });

    if (!existingAlbum) {
      throw new NotFoundException(`Album with ID ${albumId} not found`);
    }

    if (existingAlbum.wedding.admins.length === 0) {
      throw new ForbiddenException(`You do not have access to this album`);
    }

    await this.prisma.album.delete({ where: { id: albumId } });

    return {
      message: `Album with ID ${albumId} has been successfully deleted`,
    };
  }
}
