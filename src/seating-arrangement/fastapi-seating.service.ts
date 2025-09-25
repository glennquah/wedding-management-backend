import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SeatingRequestDto } from './dto/seating-request.dto';
import { SeatingResultDto } from './dto/seating-result.dto';
import { HallLayoutDto } from './dto/hall-layout.dto';

@Injectable()
export class FastApiSeatingService {
  private readonly logger = new Logger(FastApiSeatingService.name);
  private readonly fastApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.fastApiUrl = this.configService.get<string>('FASTAPI_URL');
    if (!this.fastApiUrl) {
      this.logger.error(
        'FASTAPI_URL not configured. Please set FASTAPI_URL environment variable.',
      );
    }
  }

  async getHallLayout(guestCountBucket: string, tablesPerRow?: number): Promise<HallLayoutDto> {
    if (!this.fastApiUrl) {
      throw new BadRequestException(
        'FastAPI service not configured. Please contact administrator.',
      );
    }

    try {
      // Build URL with optional tables_per_row parameter
      let url = `${this.fastApiUrl}/seating/layout/${guestCountBucket}`;
      if (tablesPerRow !== undefined) {
        url += `?tables_per_row=${tablesPerRow}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(url),
      );

      this.logger.log(
        `Successfully retrieved hall layout for bucket: ${guestCountBucket}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve hall layout for bucket ${guestCountBucket}:`,
        error.message,
      );

      if (error.response?.status === 404) {
        throw new BadRequestException(
          `Hall layout not found for guest count bucket: ${guestCountBucket}`,
        );
      }

      throw new BadRequestException(
        `Failed to retrieve hall layout: ${error.message}`,
      );
    }
  }

  async optimizeSeating(
    seatingRequest: SeatingRequestDto,
  ): Promise<SeatingResultDto> {
    if (!this.fastApiUrl) {
      throw new BadRequestException(
        'FastAPI service not configured. Please contact administrator.',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.fastApiUrl}/seating/optimize`,
          seatingRequest,
        ),
      );

      this.logger.log('Successfully optimized seating arrangement');
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to optimize seating arrangement:',
        error.message,
      );

      if (error.response?.data?.detail) {
        throw new BadRequestException(
          `Seating optimization failed: ${error.response.data.detail}`,
        );
      }

      throw new BadRequestException(
        `Failed to optimize seating: ${error.message}`,
      );
    }
  }
}
