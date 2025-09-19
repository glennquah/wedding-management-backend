import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MicrositeService } from './microsite.service';
import { MicrositeResponseDto } from './dto/microsite-response.dto';
import { CreateMicrositeDto } from './dto/create-microsite.dto';
import { UpdateMicrositeDto } from './dto/update-microsite.dto';
import { MicrositeLoginDto } from './dto/microsite-login.dto';
import { GuestLookupDto } from './dto/guest-lookup.dto';
import { ConfirmGuestDto } from './dto/confirm-guest.dto';
import { GuestResponseDto } from '../guest/dto/guest-response.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/user-role.enum';
import { JwtPayload } from '../auth/dto/jwt-payload.interface';

@ApiTags('microsite')
@Controller('microsite')
export class MicrositeController {
  constructor(private micrositeService: MicrositeService) {}

  @Get('details')
  @ApiOperation({ summary: 'Get microsite details by slug' })
  @ApiQuery({
    name: 'slug',
    type: 'string',
    description: 'Slug of the microsite (e.g., "johnjenny")',
  })
  @ApiResponse({
    status: 200,
    description: 'Microsite details retrieved successfully',
    type: MicrositeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Microsite not found.' })
  async getMicrositeDetails(
    @Query('slug') slug: string,
  ): Promise<MicrositeResponseDto> {
    return this.micrositeService.getMicrositeBySlug(slug);
  }

  @Get('wedding/:weddingId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get microsite details by wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Microsite details retrieved successfully',
    type: MicrositeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
  @ApiResponse({
    status: 404,
    description: 'Microsite not found for the wedding.',
  })
  async getMicrositeByWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<MicrositeResponseDto> {
    return this.micrositeService.getMicrositeByWeddingId(weddingId);
  }

  @Post('login')
  @ApiOperation({ summary: 'Validate microsite password' })
  @ApiResponse({
    status: 200,
    description: 'Password validation successful',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid password.' })
  @ApiResponse({ status: 404, description: 'Microsite not found.' })
  async validatePassword(
    @Body() loginDto: MicrositeLoginDto,
  ): Promise<{ isValid: boolean }> {
    return this.micrositeService.validateMicrositePassword(
      loginDto.slug,
      loginDto.password,
    );
  }

  @Post('guest/lookup')
  @ApiOperation({
    summary: 'Get guest details by full name and microsite slug',
  })
  @ApiResponse({
    status: 200,
    description: 'Guest details retrieved successfully',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest or microsite not found.' })
  async getGuestDetails(
    @Body() lookupDto: GuestLookupDto,
  ): Promise<GuestResponseDto> {
    return this.micrositeService.getGuestByNameAndWedding(
      lookupDto.fullName,
      lookupDto.micrositeSlug,
    );
  }

  @Post('guest/confirm')
  @ApiOperation({ summary: 'Confirm guest attendance for a specific wedding' })
  @ApiResponse({
    status: 200,
    description: 'Guest confirmed successfully',
    type: GuestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Guest not found for the specified wedding.',
  })
  async confirmGuest(
    @Body() confirmDto: ConfirmGuestDto,
  ): Promise<GuestResponseDto> {
    return this.micrositeService.confirmGuest(
      confirmDto.guestId,
      confirmDto.weddingId,
    );
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a microsite for a wedding' })
  @ApiResponse({
    status: 201,
    description: 'The microsite has been successfully created.',
    type: MicrositeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Admin or wedding not found.' })
  @ApiResponse({
    status: 409,
    description:
      'Microsite slug already exists or wedding already has a microsite.',
  })
  async createMicrosite(
    @Request() req: Request & { user: JwtPayload },
    @Body() createMicrositeDto: CreateMicrositeDto,
  ): Promise<MicrositeResponseDto> {
    return this.micrositeService.createMicrosite(
      req.user.sub,
      createMicrositeDto,
    );
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a microsite' })
  @ApiResponse({
    status: 200,
    description: 'The microsite has been successfully updated.',
    type: MicrositeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 404,
    description: 'Microsite not found or not owned by admin.',
  })
  @ApiResponse({
    status: 409,
    description: 'Microsite slug already exists.',
  })
  async updateMicrosite(
    @Request() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMicrositeDto: UpdateMicrositeDto,
  ): Promise<MicrositeResponseDto> {
    return this.micrositeService.updateMicrosite(
      req.user.sub,
      id,
      updateMicrositeDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a microsite' })
  @ApiResponse({
    status: 200,
    description: 'The microsite has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Microsite not found or not owned by admin.',
  })
  async deleteMicrosite(
    @Request() req: Request & { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.micrositeService.deleteMicrosite(req.user.sub, id);
  }
}
