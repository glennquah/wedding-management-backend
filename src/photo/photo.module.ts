import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PhotoService } from './photo.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Photo module handles photo processing operations including:
 * - Face detection and encoding
 * - Blur detection
 * - Face clustering
 *
 * Integrates with the FastAPI AI microservice for ML operations.
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 seconds timeout for AI operations
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [PhotoService, PrismaService],
  exports: [PhotoService], // Export for use in AlbumModule
})
export class PhotoModule {}
