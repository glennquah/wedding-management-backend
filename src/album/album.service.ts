import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Album } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PhotoService } from '../photo/photo.service';
import { AlbumResponseDto } from './dto/album-response.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumService {
  private readonly logger = new Logger(AlbumService.name);

  constructor(
    private prisma: PrismaService,
    private photoService: PhotoService,
  ) {}

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

    this.logger.log(`Adding photo to album ${albumId}: ${photoUrl}`);

    // Create Photo entity for enhanced photo management
    const photo = await this.prisma.photo.create({
      data: {
        url: photoUrl,
        albumId: albumId,
        processingStatus: 'PENDING',
      },
    });

    this.logger.log(`Created photo entity ${photo.id}`);

    // Update legacy photos array for backward compatibility
    const updatedPhotos = album.photos
      ? [...album.photos, photoUrl]
      : [photoUrl];

    const updatedAlbum = await this.prisma.album.update({
      where: { id: albumId },
      data: { photos: updatedPhotos },
    });

    // Trigger async photo processing (fire and forget)
    // This will detect faces and calculate blur score
    this.photoService
      .processPhoto(photo.id, photoUrl)
      .then(() => {
        this.logger.log(`Photo ${photo.id} processing completed`);
        // After processing, trigger clustering if enough faces detected
        return this.checkAndTriggerClustering(albumId);
      })
      .catch((err) => {
        this.logger.error(
          `Photo ${photo.id} processing failed: ${err.message}`,
          err.stack,
        );
      });

    return this.toAlbumResponseDto(updatedAlbum);
  }

  /**
   * Check if clustering should be triggered for the album.
   * Triggers clustering if there are at least 5 faces detected across all photos.
   *
   * @param albumId - Album ID to check
   */
  private async checkAndTriggerClustering(albumId: number): Promise<void> {
    // Count total faces in the album
    const faceCount = await this.prisma.photoFace.count({
      where: { photo: { albumId } },
    });

    this.logger.log(`Album ${albumId} has ${faceCount} faces detected`);

    // Only cluster if we have at least 2 faces (lowered for testing)
    // This prevents clustering with too few data points
    if (faceCount >= 2) {
      this.logger.log(`Triggering face clustering for album ${albumId}`);
      await this.photoService.clusterAlbumFaces(albumId);
    }
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
