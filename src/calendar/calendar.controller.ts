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
import { JwtPayload } from 'src/auth/dto/jwt-payload.interface';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Post('request-access')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Request calendar access from a collaborator',
  })
  @ApiResponse({
    status: 201,
    description: 'Calendar access request sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Wedding or collaborator not found',
  })
  async requestCalendarAccess(
    @Body() dto: RequestCalendarAccessDto,
  ): Promise<{ message: string }> {
    await this.calendarService.requestCalendarAccess(
      dto.collaboratorId,
      dto.weddingId,
    );
    return { message: 'Calendar access request sent successfully' };
  }

  @Get('oauth/authorize/:adminId')
  @ApiOperation({
    summary: 'Get Google OAuth authorization URL for a specific admin',
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
    @Param('adminId', ParseIntPipe) adminId: number,
  ): { authUrl: string } {
    const authUrl = this.calendarService.generateAuthUrl(adminId);
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
    description: 'State parameter containing adminId',
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
    await this.calendarService.handleOAuthCallback(code, state);

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      url: `${frontendUrl}/admin/date-optimizer?calendar_connected=success`,
    };
  }

  @Get('connection-status/:adminId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check calendar connection status for an admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar connection status',
    type: CalendarConnectionStatusDto,
  })
  async getConnectionStatus(
    @Param('adminId', ParseIntPipe) adminId: number,
  ): Promise<CalendarConnectionStatusDto> {
    return this.calendarService.getConnectionStatus(adminId);
  }

  @Post('check-availability')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check availability for multiple collaborators',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability data for collaborators',
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
}
