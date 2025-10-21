import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/user-role.enum';
import { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { AlbumService } from './album.service';
import { PhotoService } from '../photo/photo.service';
import { AlbumResponseDto } from './dto/album-response.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { ProcessingStatusDto } from '../photo/dto/processing-status.dto';
import { FaceClusterDto } from '../photo/dto/face-cluster.dto';

@ApiTags('album')
@Controller('album')
export class AlbumController {
  constructor(
    private albumService: AlbumService,
    private photoService: PhotoService,
  ) {}

  @Get('wedding/:weddingId')
  @ApiOperation({ summary: 'Get album details by wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Album details retrieved successfully',
    type: AlbumResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
  @ApiResponse({
    status: 404,
    description: 'Album not found for the wedding.',
  })
  async getAlbumByWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<AlbumResponseDto> {
    return this.albumService.getAlbumByWeddingId(weddingId);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create an album for a wedding' })
  @ApiResponse({
    status: 201,
    description: 'The album has been successfully created.',
    type: AlbumResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Admin or wedding not found.' })
  @ApiResponse({
    status: 409,
    description: 'Album slug already exists or wedding already has an album.',
  })
  async createAlbum(
    @Request() req: Request & { user: JwtPayload },
    @Body() createAlbumDto: CreateAlbumDto,
  ): Promise<AlbumResponseDto> {
    return this.albumService.createAlbum(req.user.sub, createAlbumDto);
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an album' })
  @ApiResponse({
    status: 200,
    description: 'The album has been successfully updated.',
    type: AlbumResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 404,
    description: 'Album not found or not owned by admin.',
  })
  @ApiResponse({
    status: 409,
    description: 'Album slug already exists.',
  })
  async updateAlbum(
    @Request() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ): Promise<AlbumResponseDto> {
    return this.albumService.updateAlbum(req.user.sub, id, updateAlbumDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an album' })
  @ApiResponse({
    status: 200,
    description: 'The album has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Album not found or not owned by admin.',
  })
  async deleteAlbum(
    @Request() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.albumService.deleteAlbum(req.user.sub, id);
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Add a photo to an album' })
  @ApiResponse({
    status: 200,
    description: 'Photo successfully added to the album',
    type: AlbumResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 404,
    description: 'Album not found.',
  })
  async addPhoto(
    @Param('id', ParseIntPipe) albumId: number,
    @Body() body: UpdateAlbumDto,
  ): Promise<AlbumResponseDto> {
    return this.albumService.addPhoto(albumId, body.photoUrl);
  }

  @Get(':id/processing-status')
  @ApiOperation({
    summary: 'Get photo processing status for an album',
    description:
      'Returns statistics about photo processing progress including counts of pending, processing, completed, and failed photos',
  })
  @ApiResponse({
    status: 200,
    description: 'Processing status retrieved successfully',
    type: ProcessingStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Album not found.' })
  async getProcessingStatus(
    @Param('id', ParseIntPipe) albumId: number,
  ): Promise<ProcessingStatusDto> {
    return this.photoService.getAlbumProcessingStatus(albumId);
  }

  @Get(':id/face-clusters')
  @ApiOperation({
    summary: 'Get face clusters for an album',
    description:
      'Returns groups of similar faces detected in the album photos. Each cluster represents a person.',
  })
  @ApiResponse({
    status: 200,
    description: 'Face clusters retrieved successfully',
    type: [FaceClusterDto],
  })
  @ApiResponse({ status: 404, description: 'Album not found.' })
  async getFaceClusters(
    @Param('id', ParseIntPipe) albumId: number,
  ): Promise<FaceClusterDto[]> {
    return this.photoService.getFaceClusters(albumId);
  }

  @Post(':id/trigger-clustering')
  @ApiOperation({
    summary: 'Manually trigger face clustering for an album',
    description:
      'Triggers face clustering for all unclustered faces in the album. This is automatically done after photo upload, but can be manually triggered if needed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Clustering completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Album not found.' })
  async triggerClustering(
    @Param('id', ParseIntPipe) albumId: number,
  ): Promise<{ message: string }> {
    await this.photoService.clusterAlbumFaces(albumId);
    return { message: 'Face clustering completed successfully' };
  }

  @Put(':albumId/clusters/:clusterId/label')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update label for a face cluster',
    description:
      'Set a custom label for a face cluster (e.g., "Bride", "Groom", "Best Man")',
  })
  @ApiResponse({
    status: 200,
    description: 'Cluster label updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cluster not found.' })
  async updateClusterLabel(
    @Param('albumId', ParseIntPipe) albumId: number,
    @Param('clusterId', ParseIntPipe) clusterId: number,
    @Body() body: { label: string },
  ): Promise<{ message: string }> {
    await this.photoService.updateClusterLabel(clusterId, body.label);
    return { message: 'Cluster label updated successfully' };
  }

  @Post(':id/recluster')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Re-cluster all faces in an album',
    description:
      'Clears existing face clusters and re-runs the clustering algorithm. Useful if clustering parameters are adjusted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Re-clustering completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Album not found.' })
  async reclusterAlbum(
    @Param('id', ParseIntPipe) albumId: number,
  ): Promise<{ message: string }> {
    await this.photoService.reclusterAlbum(albumId);
    return { message: 'Album re-clustered successfully' };
  }

  @Get(':id/blurry-photos')
  @ApiOperation({
    summary: 'Get blurry photo indices for an album',
    description:
      'Returns array indices of photos that have been detected as blurry',
  })
  @ApiResponse({
    status: 200,
    description: 'Blurry photo indices retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'number' },
    },
  })
  @ApiResponse({ status: 404, description: 'Album not found.' })
  async getBlurryPhotos(
    @Param('id', ParseIntPipe) albumId: number,
  ): Promise<number[]> {
    return this.photoService.getBlurryPhotoIndices(albumId);
  }
}
