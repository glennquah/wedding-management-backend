import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmailNotificationModule } from './email-notification/email-notification.module';
import { GuestModule } from './guest/guest.module';
import { ListingModule } from './listing/listing.module';
import { NotificationDetailsModule } from './notification-details/notification-details.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeatingArrangementModule } from './seating-arrangement/seating-arrangement.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { UserModule } from './user/user.module';
import { VendorModule } from './vendor/vendor.module';
import { WeddingModule } from './wedding/wedding.module';
import { MicrositeModule } from './microsite/microsite.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    MicrositeModule,
    VendorModule,
    AdminModule,
    SuperAdminModule,
    ConfigModule.forRoot(),
    AuthModule,
    GuestModule,
    WeddingModule,
    SeatingArrangementModule,
    ListingModule,
    EmailNotificationModule,
    NotificationDetailsModule,
    OrderModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
