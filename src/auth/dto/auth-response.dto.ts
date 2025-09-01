import { ApiProperty } from '@nestjs/swagger';
import { TestUserResponseDto } from 'src/test-user/dto/test-user-response.dto';

export class TokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: () => TestUserResponseDto })
  user: TestUserResponseDto;

  @ApiProperty({ type: () => TokensDto })
  backendTokens: TokensDto;
}