import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { configure } from '@vendia/serverless-express';
import { Context, Handler } from 'aws-lambda';
import * as express from 'express';

import { AppModule } from './app.module';

let cachedServer: Handler;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { rawBody: true },
    );

    nestApp.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://knotly.app',
        'https://www.knotly.app',
        'https://core.knotly.app',
        'https://www.core.knotly.app',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });

    nestApp.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        dismissDefaultMessages: false,
        validationError: { target: false },
      }),
    );

    await nestApp.init();

    cachedServer = configure({ app: expressApp });
  }
  return cachedServer;
}

export const handler = async (event: any, context: Context, callback: any) => {
  const server = await bootstrap();
  return server(event, context, callback);
};
