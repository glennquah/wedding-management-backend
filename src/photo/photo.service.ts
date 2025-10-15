import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { ProcessingStatusDto } from './dto/processing-status.dto';
import { FaceClusterDto } from './dto/face-cluster.dto';

/**
 * Service for handling photo processing operations including face detection,
 * blur detection, and face clustering using the AI microservice.
 */
@Injectable()
export class PhotoService {
  private readonly logger = new Logger(PhotoService.name);
  private readonly aiBackendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Use existing FASTAPI_URL for AI microservice
    this.aiBackendUrl =
      this.configService.get<string>('FASTAPI_URL') ||
      'http://localhost:8000';
    this.logger.log(`AI Backend URL: ${this.aiBackendUrl}`);
  }

  /**
   * Process a photo to detect faces and calculate quality metrics.
   * This calls the FastAPI microservice and stores the results.
   *
   * @param photoId - Database ID of the photo to process
   * @param url - Cloudinary URL of the image
   * @returns Promise<void>
   * @throws HttpException if processing fails
   */
  async processPhoto(photoId: number, url: string): Promise<void> {
    this.logger.log(`Processing photo ${photoId} from ${url}`);

    try {
      // Mark as processing
      await this.prisma.photo.update({
        where: { id: photoId },
        data: { processingStatus: 'PROCESSING' },
      });

      // Call FastAPI microservice
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBackendUrl}/photos/process`, {
          photo_id: photoId,
          url: url,
        }),
      );

      const { is_blurry, blur_score, faces } = response.data;

      this.logger.log(
        `Photo ${photoId} processed: ${faces.length} faces detected, blur_score=${blur_score}`,
      );

      // Update photo with quality metrics
      await this.prisma.photo.update({
        where: { id: photoId },
        data: {
          isBlurry: is_blurry,
          blurScore: blur_score,
          processingStatus: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      // Create face records
      if (faces && faces.length > 0) {
        await this.prisma.photoFace.createMany({
          data: faces.map((face: any) => ({
            photoId,
            encoding: face.encoding,
            x: face.x,
            y: face.y,
            width: face.width,
            height: face.height,
          })),
        });

        this.logger.log(`Created ${faces.length} face records for photo ${photoId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process photo ${photoId}: ${error.message}`,
        error.stack,
      );

      // Mark as failed
      await this.prisma.photo.update({
        where: { id: photoId },
        data: { processingStatus: 'FAILED' },
      });

      throw new HttpException(
        `Photo processing failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cluster faces in an album to group similar faces together.
   * Uses improved incremental clustering that matches new faces to existing clusters.
   *
   * This method:
   * 1. Gets existing clusters and their centroids
   * 2. For each new unclustered face, checks if it matches any existing cluster
   * 3. If match found (distance < 0.55), assigns to that cluster
   * 4. If no match, runs full clustering on all unclustered faces
   *
   * This approach prevents the same person from being split into multiple clusters
   * as new photos are uploaded over time.
   *
   * @param albumId - ID of the album to cluster faces for
   * @returns Promise<void>
   * @throws HttpException if clustering fails
   */
  async clusterAlbumFaces(albumId: number): Promise<void> {
    this.logger.log(`Starting face clustering for album ${albumId}`);

    try {
      // Get existing clusters with their centroids
      const existingClusters = await this.prisma.personCluster.findMany({
        where: { albumId },
        select: {
          id: true,
          representativeEncoding: true,
        },
      });

      // Get all unclustered faces
      const unclusteredFaces = await this.prisma.photoFace.findMany({
        where: {
          photo: { albumId },
          personClusterId: null,
        },
        select: {
          id: true,
          encoding: true,
        },
      });

      if (unclusteredFaces.length === 0) {
        this.logger.log(`No unclustered faces found for album ${albumId}`);
        return;
      }

      this.logger.log(
        `Processing ${unclusteredFaces.length} unclustered faces with ${existingClusters.length} existing clusters`,
      );

      // Step 1: Try to match unclustered faces to existing clusters
      const remainingFaces = [];
      let matchedCount = 0;

      for (const face of unclusteredFaces) {
        let bestMatch: { clusterId: number; distance: number } | null = null;

        // Compare face encoding with each existing cluster centroid
        for (const cluster of existingClusters) {
          const faceEncoding = face.encoding as number[];
          const clusterCentroid = cluster.representativeEncoding as number[];

          // Calculate euclidean distance
          const distance = Math.sqrt(
            faceEncoding.reduce(
              (sum, val, i) => sum + Math.pow(val - clusterCentroid[i], 2),
              0,
            ),
          );

          // If this is the closest cluster so far and within threshold
          if (
            distance < 0.55 &&
            (!bestMatch || distance < bestMatch.distance)
          ) {
            bestMatch = { clusterId: cluster.id, distance };
          }
        }

        // If a good match was found, assign face to that cluster
        if (bestMatch) {
          await this.prisma.photoFace.update({
            where: { id: face.id },
            data: { personClusterId: bestMatch.clusterId },
          });
          matchedCount++;
          this.logger.debug(
            `Matched face ${face.id} to existing cluster ${bestMatch.clusterId} (distance: ${bestMatch.distance.toFixed(3)})`,
          );
        } else {
          // No good match, add to list for full clustering
          remainingFaces.push(face);
        }
      }

      this.logger.log(
        `Matched ${matchedCount} faces to existing clusters, ${remainingFaces.length} faces need clustering`,
      );

      // Step 2: Cluster remaining faces that didn't match any existing cluster
      if (remainingFaces.length === 0) {
        this.logger.log(`All faces matched to existing clusters`);
        return;
      }

      // Call clustering API for remaining faces
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBackendUrl}/photos/cluster`, {
          album_id: albumId,
          face_encodings: remainingFaces.map((f) => ({
            face_id: f.id,
            encoding: f.encoding,
          })),
        }),
      );

      const { clusters } = response.data;

      this.logger.log(
        `Received ${clusters.length} new clusters for remaining faces`,
      );

      // Create new person clusters and assign faces
      for (const cluster of clusters) {
        // Get first face photo for thumbnail
        const firstFace = await this.prisma.photoFace.findUnique({
          where: { id: cluster.face_ids[0] },
          include: { photo: true },
        });

        // Create person cluster
        const personCluster = await this.prisma.personCluster.create({
          data: {
            albumId,
            representativeEncoding: cluster.centroid,
            thumbnailUrl: firstFace?.photo.url || null,
          },
        });

        // Assign faces to cluster
        await this.prisma.photoFace.updateMany({
          where: { id: { in: cluster.face_ids } },
          data: { personClusterId: personCluster.id },
        });

        this.logger.log(
          `Created new cluster ${personCluster.id} with ${cluster.face_ids.length} faces`,
        );
      }

      this.logger.log(`Face clustering completed for album ${albumId}`);
    } catch (error) {
      this.logger.error(
        `Failed to cluster faces for album ${albumId}: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        `Face clustering failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get processing status for all photos in an album.
   *
   * @param albumId - ID of the album
   * @returns Promise<ProcessingStatusDto>
   */
  async getAlbumProcessingStatus(
    albumId: number,
  ): Promise<ProcessingStatusDto> {
    this.logger.log(`Getting processing status for album ${albumId}`);

    const stats = await this.prisma.photo.groupBy({
      by: ['processingStatus'],
      where: { albumId },
      _count: true,
    });

    const total = stats.reduce((sum, s) => sum + s._count, 0);
    const pending =
      stats.find((s) => s.processingStatus === 'PENDING')?._count || 0;
    const processing =
      stats.find((s) => s.processingStatus === 'PROCESSING')?._count || 0;
    const completed =
      stats.find((s) => s.processingStatus === 'COMPLETED')?._count || 0;
    const failed =
      stats.find((s) => s.processingStatus === 'FAILED')?._count || 0;

    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
    };
  }

  /**
   * Get face clusters for an album.
   *
   * @param albumId - ID of the album
   * @returns Promise<FaceClusterDto[]>
   */
  async getFaceClusters(albumId: number): Promise<FaceClusterDto[]> {
    this.logger.log(`Getting face clusters for album ${albumId}`);

    // Get all photos in order (to create URL -> index mapping)
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
      select: { photos: true },
    });

    if (!album) {
      return [];
    }

    // Create a mapping from photo URL to array index
    const urlToIndexMap = new Map<string, number>();
    album.photos.forEach((url, index) => {
      urlToIndexMap.set(url, index);
    });

    const clusters = await this.prisma.personCluster.findMany({
      where: { albumId },
      include: {
        faces: {
          include: { photo: true },
        },
      },
      orderBy: {
        // Order by cluster size (largest first)
        faces: {
          _count: 'desc',
        },
      },
    });

    return clusters.map((cluster) => ({
      id: cluster.id,
      label: cluster.label,
      faceCount: cluster.faces.length,
      thumbnailUrl: cluster.thumbnailUrl,
      // Map photo URLs to their array indices
      photoIds: [
        ...new Set(
          cluster.faces
            .map((f) => urlToIndexMap.get(f.photo.url))
            .filter((idx) => idx !== undefined) as number[],
        ),
      ],
    }));
  }

  /**
   * Update label for a person cluster.
   *
   * @param clusterId - ID of the cluster
   * @param label - New label (e.g., "Bride", "Groom")
   * @returns Promise<void>
   */
  async updateClusterLabel(clusterId: number, label: string): Promise<void> {
    this.logger.log(`Updating cluster ${clusterId} label to "${label}"`);

    await this.prisma.personCluster.update({
      where: { id: clusterId },
      data: { label },
    });
  }

  /**
   * Re-cluster all faces in an album (clears existing clusters first).
   * Useful if clustering parameters need adjustment.
   *
   * @param albumId - ID of the album
   * @returns Promise<void>
   */
  async reclusterAlbum(albumId: number): Promise<void> {
    this.logger.log(`Re-clustering album ${albumId}`);

    // Clear existing cluster assignments
    await this.prisma.photoFace.updateMany({
      where: { photo: { albumId } },
      data: { personClusterId: null },
    });

    // Delete existing clusters
    await this.prisma.personCluster.deleteMany({
      where: { albumId },
    });

    // Run clustering
    await this.clusterAlbumFaces(albumId);
  }

  /**
   * Get array indices of blurry photos in an album.
   *
   * @param albumId - ID of the album
   * @returns Promise<number[]> - Array of photo indices that are blurry
   */
  async getBlurryPhotoIndices(albumId: number): Promise<number[]> {
    this.logger.log(`Getting blurry photo indices for album ${albumId}`);

    // Get album with photos array
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
      select: { photos: true },
    });

    if (!album) {
      return [];
    }

    // Create URL to index mapping
    const urlToIndexMap = new Map<string, number>();
    album.photos.forEach((url, index) => {
      urlToIndexMap.set(url, index);
    });

    // Get all blurry photos
    const blurryPhotos = await this.prisma.photo.findMany({
      where: {
        albumId,
        isBlurry: true,
      },
      select: {
        url: true,
      },
    });

    // Map URLs to indices
    const blurryIndices = blurryPhotos
      .map((photo) => urlToIndexMap.get(photo.url))
      .filter((idx) => idx !== undefined) as number[];

    this.logger.log(
      `Found ${blurryIndices.length} blurry photos in album ${albumId}`,
    );

    return blurryIndices;
  }
}
