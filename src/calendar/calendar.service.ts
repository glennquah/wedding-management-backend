import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';
import { EmailNotificationService } from '../email-notification/email-notification.service';
import {
  AttendeeAvailability,
  AvailabilityCheckDto,
  AvailabilityCheckResponseDto,
} from './dto/availability-check.dto';
import { CalendarConnectionStatusDto } from './dto/calendar-connection-status.dto';

@Injectable()
export class CalendarService {
  private oauth2Client: Auth.OAuth2Client;
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailNotificationService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );
  }

  /**
   * Generate OAuth URL for a collaborator to authorize calendar access
   */
  generateAuthUrl(adminId: number): string {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state: adminId.toString(), // Pass adminId in state to identify user
      prompt: 'consent', // Force consent screen to always get refresh token
    });

    return authUrl;
  }

  /**
   * Handle OAuth callback and store tokens
   */
  async handleOAuthCallback(code: string, state: string): Promise<void> {
    const adminId = parseInt(state, 10);

    if (isNaN(adminId)) {
      throw new BadRequestException('Invalid state parameter');
    }

    // Verify admin exists
    const admin = await this.prisma.admin.findUnique({
      where: { userId: adminId },
      include: { user: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Exchange code for tokens
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new BadRequestException('Failed to obtain tokens');
    }

    // Get user's email from Google
    this.oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const email = userInfo.data.email || admin.user.email;

    // Calculate token expiry (default 1 hour from now)
    const expiryDate = new Date();
    expiryDate.setSeconds(
      expiryDate.getSeconds() + (tokens.expiry_date ? tokens.expiry_date / 1000 : 3600),
    );

    // Store or update connection
    await this.prisma.googleCalendarConnection.upsert({
      where: { adminId },
      create: {
        adminId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: expiryDate,
        email,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: expiryDate,
        email,
      },
    });

    this.logger.log(`Calendar connected for admin ${adminId}`);
  }

  /**
   * Request calendar access from a collaborator
   */
  async requestCalendarAccess(
    collaboratorId: number,
    weddingId: number,
  ): Promise<void> {
    // Verify wedding and collaborator
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: { admins: { include: { user: true } } },
    });

    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }

    const collaborator = wedding.admins.find((a) => a.userId === collaboratorId);
    if (!collaborator) {
      throw new NotFoundException('Collaborator not found for this wedding');
    }

    // Generate auth URL
    const authUrl = this.generateAuthUrl(collaboratorId);

    // Send email notification using template
    await this.emailService.sendCalendarAccessRequest(
      collaborator.user.email,
      collaborator.user.name,
      wedding.name,
      authUrl,
      weddingId,
    );

    this.logger.log(
      `Calendar access requested for collaborator ${collaboratorId} on wedding ${weddingId}`,
    );
  }

  /**
   * Check calendar connection status for an admin
   */
  async getConnectionStatus(
    adminId: number,
  ): Promise<CalendarConnectionStatusDto> {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { adminId },
    });

    if (!connection) {
      return { isConnected: false };
    }

    return {
      isConnected: true,
      email: connection.email,
      connectedAt: connection.createdAt.toISOString(),
    };
  }

  /**
   * Refresh access token if expired
   */
  private async refreshAccessToken(connection: any): Promise<string> {
    this.oauth2Client.setCredentials({
      refresh_token: connection.refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();

    // Update stored token
    await this.prisma.googleCalendarConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: credentials.access_token || connection.accessToken,
        tokenExpiry: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : connection.tokenExpiry,
      },
    });

    return credentials.access_token || connection.accessToken;
  }

  /**
   * Check availability for multiple collaborators
   */
  async checkAvailability(
    dto: AvailabilityCheckDto,
  ): Promise<AvailabilityCheckResponseDto> {
    const attendees: AttendeeAvailability[] = [];

    for (const collaboratorId of dto.collaboratorIds) {
      const admin = await this.prisma.admin.findUnique({
        where: { userId: collaboratorId },
        include: {
          user: true,
          googleCalendarConnection: true,
        },
      });

      if (!admin) {
        this.logger.warn(`Admin ${collaboratorId} not found`);
        continue;
      }

      const connection = admin.googleCalendarConnection;

      if (!connection) {
        attendees.push({
          collaboratorId,
          name: admin.user.name,
          isConnected: false,
          busySlots: [],
        });
        continue;
      }

      try {
        // Refresh token if expired
        const now = new Date();
        let accessToken = connection.accessToken;

        if (connection.tokenExpiry < now) {
          accessToken = await this.refreshAccessToken(connection);
        }

        // Set credentials
        this.oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: connection.refreshToken,
        });

        // Query calendar
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin: dto.startDate,
            timeMax: dto.endDate,
            items: [{ id: 'primary' }],
          },
        });

        const busySlots =
          response.data.calendars?.['primary']?.busy?.map((slot) => ({
            start: slot.start || '',
            end: slot.end || '',
          })) || [];

        attendees.push({
          collaboratorId,
          name: admin.user.name,
          isConnected: true,
          busySlots,
        });
      } catch (error) {
        this.logger.error(
          `Error fetching calendar for admin ${collaboratorId}: ${error.message}`,
        );
        attendees.push({
          collaboratorId,
          name: admin.user.name,
          isConnected: true,
          busySlots: [],
        });
      }
    }

    return { attendees };
  }

  /**
   * Disconnect calendar for an admin
   */
  async disconnectCalendar(adminId: number): Promise<void> {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { adminId },
    });

    if (!connection) {
      throw new NotFoundException('Calendar connection not found');
    }

    await this.prisma.googleCalendarConnection.delete({
      where: { adminId },
    });

    this.logger.log(`Calendar disconnected for admin ${adminId}`);
  }
}
