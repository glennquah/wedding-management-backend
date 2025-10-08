import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { VendorRecommendationRequestDto } from './dto/vendor-recommendation-request.dto';
import { VendorRecommendationResponseDto } from './dto/vendor-recommendation-response.dto';

@Injectable()
export class FastApiRecommendationService {
  private readonly logger = new Logger(FastApiRecommendationService.name);
  private readonly fastApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.fastApiUrl = this.configService.get<string>('FASTAPI_URL');
    if (!this.fastApiUrl) {
      this.logger.error(
        'FASTAPI_URL not configured. Please set FASTAPI_URL environment variable.',
      );
    }
  }

  async getVendorRecommendations(
    request: VendorRecommendationRequestDto,
  ): Promise<VendorRecommendationResponseDto> {
    if (!this.fastApiUrl) {
      throw new BadRequestException(
        'FastAPI service not configured. Please contact administrator.',
      );
    }

    // Fetch wedding details from database
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: request.wedding_id },
    });

    if (!wedding) {
      throw new NotFoundException(
        `Wedding with ID ${request.wedding_id} not found`,
      );
    }

    // Build the request payload for FastAPI
    const fastApiRequest = {
      wedding_data: {
        wedding_id: wedding.id,
        wedding_type: wedding.weddingType,
        budget_bucket: wedding.budgetBucket,
        guest_count_bucket: wedding.guestCountBucket,
        preferred_style: wedding.preferredStyle,
        preferred_services: wedding.preferredServices,
      },
      top_k: request.top_k || 20,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.fastApiUrl}/recommendations/vendors`,
          fastApiRequest,
        ),
      );

      this.logger.log(
        `Successfully generated vendor recommendations for wedding ${request.wedding_id}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to generate vendor recommendations:',
        error.message,
      );

      if (error.response?.data?.detail) {
        throw new BadRequestException(
          `Vendor recommendation failed: ${error.response.data.detail}`,
        );
      }

      throw new BadRequestException(
        `Failed to generate recommendations: ${error.message}`,
      );
    }
  }
}
