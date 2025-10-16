import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GratitudeCardService } from './gratitude-card.service';
import { GratitudeCardResponseDto } from './dto/gratitude-card-response.dto';
import { CreateGratitudeCardDto } from './dto/create-guest-card.dto';
import { UpdateGratitudeCardDto } from './dto/update-gratitude-card.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/user-role.enum';
import { JwtPayload } from 'src/auth/dto/jwt-payload.interface';

@ApiTags('gratitude-card')
@Controller('gratitude-card')
export class GratitudeCardController {
  constructor(private gratitudeCardService: GratitudeCardService) {}

  @Get('wedding/:weddingId')
  @ApiOperation({ summary: 'Get gratitude card by wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Gratitude card retrieved successfully.',
    type: GratitudeCardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Gratitude card not found.' })
  async getGratitudeCardByWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<GratitudeCardResponseDto> {
    return this.gratitudeCardService.getGratitudeCardByWeddingId(weddingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gratitude card by card ID' })
  @ApiResponse({
    status: 200,
    description: 'Gratitude card retrieved successfully.',
    type: GratitudeCardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Gratitude card not found.' })
  async getGratitudeCardById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GratitudeCardResponseDto> {
    return this.gratitudeCardService.getGratitudeCardById(id);
  }

  @Post('guest')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create guest gratitude card for a wedding' })
  @ApiResponse({
    status: 201,
    description: 'Guest gratitude card created successfully.',
    type: GratitudeCardResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not wedding admin.' })
  @ApiResponse({ status: 404, description: 'Admin or wedding not found.' })
  @ApiResponse({
    status: 409,
    description: 'Wedding already has a gratitude card.',
  })
  async createGuestGratitudeCard(
    @Request() req: Request & { user: JwtPayload },
    @Body() createGuestCardDto: CreateGratitudeCardDto,
  ): Promise<GratitudeCardResponseDto> {
    return this.gratitudeCardService.createGuestGratitudeCard(
      req.user.sub,
      createGuestCardDto,
    );
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Update gratitude card message and photo for a specific recipient type (guest, collab, vendor)',
  })
  @ApiResponse({
    status: 200,
    description: 'Gratitude card updated successfully.',
    type: GratitudeCardResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Gratitude card not found or not owned by admin.',
  })
  async updateGratitudeCard(
    @Request() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateGratitudeCardDto,
  ): Promise<GratitudeCardResponseDto> {
    return this.gratitudeCardService.updateGratitudeCard(
      req.user.sub,
      id,
      updateCardDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a gratitude card by ID' })
  @ApiResponse({
    status: 200,
    description: 'Gratitude card deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Gratitude card not found or not owned by admin.',
  })
  async deleteGratitudeCard(
    @Request() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.gratitudeCardService.deleteGratitudeCard(req.user.sub, id);
  }
}
