import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GuestModule } from './guest/guest.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestUserModule } from './test-user/test-user.module';
import { WeddingModule } from './wedding/wedding.module';

@Module({
  imports: [
    PrismaModule,
    TestUserModule,
    ConfigModule.forRoot(),
    AuthModule,
    GuestModule,
    WeddingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
