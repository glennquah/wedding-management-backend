import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TestUserModule } from './test-user/test-user.module';
import { AuthModule } from './auth/auth.module';
import { GuestModule } from './guest/guest.module';

@Module({
  imports: [PrismaModule, TestUserModule, ConfigModule.forRoot(), AuthModule, GuestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
