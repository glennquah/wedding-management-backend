import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/user-role.enum';
import { CalendarService } from './calendar.service';
import { RequestCalendarAccessDto } from './dto/request-calendar-access.dto';
import { CalendarConnectionStatusDto } from './dto/calendar-connection-status.dto';
import {
  AvailabilityCheckDto,
  AvailabilityCheckResponseDto,
} from './dto/availability-check.dto';
import {
  OptimizeDateRequestDto,
  OptimizeDateResponseDto,
} from './dto/date-optimization.dto';
import { JwtPayload } from 'src/auth/dto/jwt-payload.interface';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Post('request-access')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Request calendar access from an admin or guest',
  })
  @ApiResponse({
    status: 201,
    description: 'Calendar access request sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Wedding or user not found',
  })
  async requestCalendarAccess(
    @Body() dto: RequestCalendarAccessDto,
  ): Promise<{ message: string }> {
    await this.calendarService.requestCalendarAccess(
      dto.attendeeId,
      dto.weddingId,
      dto.isAdmin || false,
    );
    return { message: 'Calendar access request sent successfully' };
  }

  @Get('oauth/authorize/:userId')
  @ApiOperation({
    summary: 'Get Google OAuth authorization URL for a user (admin or guest)',
  })
  @ApiQuery({
    name: 'isAdmin',
    description: 'Whether the user is an admin (true) or guest (false)',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'returnUrl',
    description:
      'URL path to redirect to after OAuth callback (e.g., /admin/date-optimizer)',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated',
    schema: {
      type: 'object',
      properties: {
        authUrl: { type: 'string' },
      },
    },
  })
  getAuthUrl(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('isAdmin') isAdmin?: string,
    @Query('returnUrl') returnUrl?: string,
  ): { authUrl: string } {
    const authUrl = this.calendarService.generateAuthUrl(
      userId,
      isAdmin === 'true',
      returnUrl,
    );
    return { authUrl };
  }

  @Get('oauth/callback')
  @ApiOperation({
    summary: 'Handle Google OAuth callback',
  })
  @ApiQuery({
    name: 'code',
    description: 'Authorization code from Google',
    required: true,
  })
  @ApiQuery({
    name: 'state',
    description: 'State parameter containing userId and isAdmin flag',
    required: true,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to success page',
  })
  @Redirect()
  async handleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const returnPath = await this.calendarService.handleOAuthCallback(
      code,
      state,
    );

    // Redirect to the specified return URL or date-optimizer page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      url: `${frontendUrl}${returnPath}`,
    };
  }

  @Get('connection-status/:userId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check calendar connection status for an admin or guest',
  })
  @ApiQuery({
    name: 'isAdmin',
    description: 'Whether the user is an admin (true) or guest (false)',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar connection status',
    type: CalendarConnectionStatusDto,
  })
  async getConnectionStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('isAdmin') isAdmin?: string,
  ): Promise<CalendarConnectionStatusDto> {
    return this.calendarService.getConnectionStatus(userId, isAdmin === 'true');
  }

  @Post('check-availability')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check availability for multiple users (admins and guests)',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability data for users',
    type: AvailabilityCheckResponseDto,
  })
  async checkAvailability(
    @Body() dto: AvailabilityCheckDto,
  ): Promise<AvailabilityCheckResponseDto> {
    return this.calendarService.checkAvailability(dto);
  }

  @Delete('disconnect')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Disconnect calendar for the authenticated admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar disconnected successfully',
  })
  async disconnectCalendar(
    @Request() req: Request & { user: JwtPayload },
  ): Promise<{ message: string }> {
    await this.calendarService.disconnectCalendar(req.user.sub);
    return { message: 'Calendar disconnected successfully' };
  }

  @Delete('disconnect/:userId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Disconnect calendar for a specific user (guest or admin)',
  })
  @ApiQuery({
    name: 'isAdmin',
    description: 'Whether the user is an admin (true) or guest (false)',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar disconnected successfully',
  })
  async disconnectUserCalendar(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('isAdmin') isAdmin?: string,
  ): Promise<{ message: string }> {
    await this.calendarService.disconnectCalendar(userId, isAdmin === 'true');
    return { message: 'Calendar disconnected successfully' };
  }

  @Post('optimize-date')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Optimize wedding date using AI-powered scheduling algorithm',
  })
  @ApiResponse({
    status: 200,
    description: 'Date optimization results',
    type: OptimizeDateResponseDto,
  })
  async optimizeWeddingDate(
    @Body() dto: OptimizeDateRequestDto,
  ): Promise<OptimizeDateResponseDto> {
    return this.calendarService.optimizeWeddingDate(dto);
  }
}
