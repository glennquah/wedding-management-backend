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
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/user-role.enum';
import { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { AlbumService } from './album.service';
import { AlbumResponseDto } from './dto/album-response.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@ApiTags('album')
@Controller('album')
export class AlbumController {
  constructor(private albumService: AlbumService) {}

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

  @Get(':id/download')
  @ApiOperation({ summary: 'Download all photos in an album as a ZIP file' })
  @ApiResponse({
    status: 200,
    description: 'ZIP file containing all album photos',
    content: {
      'application/zip': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Album not found or no photos in album.',
  })
  async downloadAlbum(
    @Param('id', ParseIntPipe) albumId: number,
  ): Promise<StreamableFile> {
    return this.albumService.streamAlbumZip(albumId);
  }
}
