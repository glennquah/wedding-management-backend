import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DatingPartnerApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers['x-api-key'];

    const masterApiKey = process.env.DATING_PARTNER_API_KEY;

    if (!apiKey) {
      throw new UnauthorizedException('Partner API Key is missing');
    }

    if (apiKey !== masterApiKey) {
      throw new UnauthorizedException('Invalid partner API Key');
    }

    return true;
  }
}
