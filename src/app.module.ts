import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TestUserModule } from './test-user/test-user.module';
import { UserModule } from './user/user.module';
import { VendorModule } from './vendor/vendor.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, TestUserModule, UserModule, VendorModule, ConfigModule.forRoot(), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
