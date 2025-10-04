import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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
import {
  OptimizeDateRequestDto,
  OptimizeDateResponseDto,
} from './dto/date-optimization.dto';
import axios from 'axios';

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
   * Generate OAuth URL for a guest or admin to authorize calendar access
   */
  generateAuthUrl(userId: number, isAdmin: boolean): string {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.events.readonly', // Read calendar events (includes all-day events)
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state: JSON.stringify({ userId, isAdmin }), // Pass userId and type in state
      prompt: 'consent', // Force consent screen to always get refresh token
    });

    return authUrl;
  }

  /**
   * Handle OAuth callback and store tokens
   */
  async handleOAuthCallback(code: string, state: string): Promise<void> {
    let userId: number;
    let isAdmin: boolean;

    try {
      const parsedState = JSON.parse(state);
      userId = parsedState.userId;
      isAdmin = parsedState.isAdmin;
    } catch (error) {
      throw new BadRequestException('Invalid state parameter');
    }

    if (!userId) {
      throw new BadRequestException('Invalid state parameter');
    }

    // Verify user exists
    if (isAdmin) {
      const admin = await this.prisma.admin.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
    } else {
      const guest = await this.prisma.guest.findUnique({
        where: { id: userId },
      });

      if (!guest) {
        throw new NotFoundException('Guest not found');
      }
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

    const email = userInfo.data.email;

    // Calculate token expiry (default 1 hour from now)
    const expiryDate = new Date();
    expiryDate.setSeconds(
      expiryDate.getSeconds() +
        (tokens.expiry_date ? tokens.expiry_date / 1000 : 3600),
    );

    // Store or update connection
    if (isAdmin) {
      await this.prisma.googleCalendarConnection.upsert({
        where: { adminId: userId },
        create: {
          adminId: userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: expiryDate,
          email,
          accessStatus: 'CONNECTED',
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: expiryDate,
          email,
          accessStatus: 'CONNECTED',
        },
      });

      this.logger.log(`Calendar connected for admin ${userId}`);
    } else {
      await this.prisma.googleCalendarConnection.upsert({
        where: { guestId: userId },
        create: {
          guestId: userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: expiryDate,
          email,
          accessStatus: 'CONNECTED',
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: expiryDate,
          email,
          accessStatus: 'CONNECTED',
        },
      });

      this.logger.log(`Calendar connected for guest ${userId}`);
    }
  }

  /**
   * Request calendar access from a guest or admin
   */
  async requestCalendarAccess(
    userId: number,
    weddingId: number,
    isAdmin: boolean = false,
  ): Promise<void> {
    let email: string;
    let name: string;
    let weddingName: string;

    if (isAdmin) {
      // Verify admin exists and belongs to wedding
      const admin = await this.prisma.admin.findUnique({
        where: { userId },
        include: {
          user: true,
          weddings: {
            where: { id: weddingId },
          },
        },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      if (admin.weddings.length === 0) {
        throw new BadRequestException('Admin does not belong to this wedding');
      }

      email = admin.user.email;
      name = admin.user.name;
      weddingName = admin.weddings[0].name;
    } else {
      // Verify guest exists and belongs to wedding
      const guest = await this.prisma.guest.findUnique({
        where: { id: userId },
        include: { wedding: true },
      });

      if (!guest) {
        throw new NotFoundException('Guest not found');
      }

      if (guest.weddingId !== weddingId) {
        throw new BadRequestException('Guest does not belong to this wedding');
      }

      email = guest.email;
      name = guest.name;
      weddingName = guest.wedding.name;
    }

    // Generate auth URL
    const authUrl = this.generateAuthUrl(userId, isAdmin);

    // Create or update calendar connection record to track request status
    if (isAdmin) {
      await this.prisma.googleCalendarConnection.upsert({
        where: { adminId: userId },
        create: {
          adminId: userId,
          accessToken: '', // Placeholder until user authorizes
          refreshToken: '', // Placeholder until user authorizes
          tokenExpiry: new Date(), // Placeholder until user authorizes
          email,
          accessStatus: 'REQUESTED',
          accessRequestedAt: new Date(),
        },
        update: {
          accessStatus: 'REQUESTED',
          accessRequestedAt: new Date(),
        },
      });
    } else {
      await this.prisma.googleCalendarConnection.upsert({
        where: { guestId: userId },
        create: {
          guestId: userId,
          accessToken: '', // Placeholder until user authorizes
          refreshToken: '', // Placeholder until user authorizes
          tokenExpiry: new Date(), // Placeholder until user authorizes
          email,
          accessStatus: 'REQUESTED',
          accessRequestedAt: new Date(),
        },
        update: {
          accessStatus: 'REQUESTED',
          accessRequestedAt: new Date(),
        },
      });
    }

    // Send email notification using template
    await this.emailService.sendCalendarAccessRequest(
      email,
      name,
      weddingName,
      authUrl,
      weddingId,
    );

    this.logger.log(
      `Calendar access requested for ${isAdmin ? 'admin' : 'guest'} ${userId} on wedding ${weddingId}`,
    );
  }

  /**
   * Check calendar connection status for a guest or admin
   */
  async getConnectionStatus(
    userId: number,
    isAdmin: boolean = false,
  ): Promise<CalendarConnectionStatusDto> {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: isAdmin ? { adminId: userId } : { guestId: userId },
    });

    if (!connection) {
      return {
        isConnected: false,
        accessStatus: 'NOT_REQUESTED' as any,
      };
    }

    return {
      isConnected: connection.accessStatus === 'CONNECTED',
      accessStatus: connection.accessStatus as any,
      email: connection.email || undefined,
      connectedAt:
        connection.accessStatus === 'CONNECTED'
          ? connection.createdAt.toISOString()
          : undefined,
      accessRequestedAt: connection.accessRequestedAt?.toISOString(),
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
   * Check availability for multiple guests and admins
   */
  async checkAvailability(
    dto: AvailabilityCheckDto,
  ): Promise<AvailabilityCheckResponseDto> {
    const attendees: AttendeeAvailability[] = [];

    for (const attendeeId of dto.attendeeIds) {
      let name: string;
      let accessToken: string;
      let refreshToken: string;
      let tokenExpiry: Date;

      // Try to find as admin first
      const adminConnection =
        await this.prisma.googleCalendarConnection.findUnique({
          where: { adminId: attendeeId },
          include: { admin: { include: { user: true } } },
        });

      if (adminConnection) {
        name = adminConnection.admin.user.name;
        accessToken = adminConnection.accessToken;
        refreshToken = adminConnection.refreshToken;
        tokenExpiry = adminConnection.tokenExpiry;
      } else {
        // Try as guest
        const guestConnection =
          await this.prisma.googleCalendarConnection.findUnique({
            where: { guestId: attendeeId },
            include: { guest: true },
          });

        if (guestConnection) {
          name = guestConnection.guest.name;
          accessToken = guestConnection.accessToken;
          refreshToken = guestConnection.refreshToken;
          tokenExpiry = guestConnection.tokenExpiry;
        } else {
          // No connection found, check if user exists
          const admin = await this.prisma.admin.findUnique({
            where: { userId: attendeeId },
            include: { user: true },
          });

          if (admin) {
            name = admin.user.name;
            attendees.push({
              attendeeId,
              name,
              isConnected: false,
              busySlots: [],
            });
            continue;
          }

          const guest = await this.prisma.guest.findUnique({
            where: { id: attendeeId },
          });

          if (guest) {
            name = guest.name;
            attendees.push({
              attendeeId,
              name,
              isConnected: false,
              busySlots: [],
            });
            continue;
          }

          this.logger.warn(`Attendee ${attendeeId} not found`);
          continue;
        }
      }

      try {
        // Check if this is a mock connection (for testing)
        const isMockConnection = accessToken.startsWith('mock_');

        let busySlots = [];

        if (isMockConnection) {
          // Generate mock busy slots for testing
          busySlots = this.generateMockBusySlots(
            dto.startDate,
            dto.endDate,
            attendeeId,
          );
        } else {
          // Real Google Calendar connection
          // Refresh token if expired
          const now = new Date();
          let currentAccessToken = accessToken;

          if (tokenExpiry < now) {
            // Need to refresh - fetch the connection to pass to refresh method
            const connectionToRefresh =
              adminConnection ||
              (await this.prisma.googleCalendarConnection.findUnique({
                where: { guestId: attendeeId },
              }));
            currentAccessToken =
              await this.refreshAccessToken(connectionToRefresh);
          }

          // Set credentials
          this.oauth2Client.setCredentials({
            access_token: currentAccessToken,
            refresh_token: refreshToken,
          });

          // Query calendar - use events.list instead of freebusy to capture all-day events
          const calendar = google.calendar({
            version: 'v3',
            auth: this.oauth2Client,
          });

          // Fetch events (including all-day events)
          const eventsResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: dto.startDate,
            timeMax: dto.endDate,
            singleEvents: true,
            orderBy: 'startTime',
          });

          busySlots = [];

          // Process events - include both timed events and all-day events
          for (const event of eventsResponse.data.items || []) {
            // Skip if event is cancelled or status is not confirmed
            if (event.status === 'cancelled') continue;

            // Check if it's an all-day event (uses 'date' instead of 'dateTime')
            if (event.start?.date) {
              // All-day event - use UTC to avoid timezone shifts
              // Google Calendar returns all-day events as YYYY-MM-DD strings
              const startDateStr = event.start.date;
              const endDateStr = event.end?.date || event.start.date;

              // Create dates in UTC to preserve the exact date
              const [startYear, startMonth, startDay] = startDateStr
                .split('-')
                .map(Number);
              const startDate = new Date(
                Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0),
              );

              const [endYear, endMonth, endDay] = endDateStr
                .split('-')
                .map(Number);
              const endDate = new Date(
                Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999),
              );

              busySlots.push({
                start: startDate.toISOString(),
                end: endDate.toISOString(),
              });
            } else if (event.start?.dateTime && event.end?.dateTime) {
              busySlots.push({
                start: event.start.dateTime,
                end: event.end.dateTime,
              });
            }
          }
        }

        attendees.push({
          attendeeId,
          name,
          isConnected: true,
          busySlots,
        });
      } catch (error) {
        this.logger.error(
          `Error fetching calendar for attendee ${attendeeId}: ${error.message}`,
        );
        attendees.push({
          attendeeId,
          name,
          isConnected: true,
          busySlots: [],
        });
      }
    }

    return { attendees };
  }

  /**
   * Disconnect calendar for a guest or admin
   */
  async disconnectCalendar(
    userId: number,
    isAdmin: boolean = false,
  ): Promise<void> {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: isAdmin ? { adminId: userId } : { guestId: userId },
    });

    if (!connection) {
      throw new NotFoundException('Calendar connection not found');
    }

    await this.prisma.googleCalendarConnection.delete({
      where: { id: connection.id },
    });
  }

  /**
   * Generate mock busy slots for testing (seeded calendar connections)
   */
  private generateMockBusySlots(
    startDate: string,
    endDate: string,
    guestId: number,
  ): Array<{ start: string; end: string }> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const busySlots: Array<{ start: string; end: string }> = [];

    // Use guestId as seed for consistent but different patterns per user
    const seed = guestId % 10;

    // Generate some mock busy periods
    const current = new Date(start);
    while (current <= end) {
      // Skip weekends sometimes based on seed
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        // Work hours busy slot (weekdays)
        if ((current.getDate() + seed) % 3 === 0) {
          const busyStart = new Date(current);
          busyStart.setHours(9, 0, 0, 0);
          const busyEnd = new Date(current);
          busyEnd.setHours(17, 0, 0, 0);

          busySlots.push({
            start: busyStart.toISOString(),
            end: busyEnd.toISOString(),
          });
        }
      } else {
        // Random weekend events
        if ((current.getDate() + seed) % 4 === 0) {
          const busyStart = new Date(current);
          busyStart.setHours(14, 0, 0, 0);
          const busyEnd = new Date(current);
          busyEnd.setHours(18, 0, 0, 0);

          busySlots.push({
            start: busyStart.toISOString(),
            end: busyEnd.toISOString(),
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return busySlots;
  }

  /**
   * Optimize wedding date using AI backend
   */
  async optimizeWeddingDate(
    dto: OptimizeDateRequestDto,
  ): Promise<OptimizeDateResponseDto> {
    const fastApiUrl = this.configService.get<string>('FASTAPI_URL');

    if (!fastApiUrl) {
      throw new BadRequestException('AI Backend URL not configured');
    }

    try {
      const response = await axios.post<OptimizeDateResponseDto>(
        `${fastApiUrl}/scheduling/optimize`,
        dto,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Error calling AI backend for date optimization:',
        error,
      );
      throw new BadRequestException(
        `Failed to optimize date: ${error.response?.data?.detail || error.message}`,
      );
    }
  }
}
