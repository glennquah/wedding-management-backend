import { TestUser } from '@prisma/client';
import { TestUserResponseDto } from './dto/test-user-response.dto';

export function toTestUserResponseDto(user: TestUser): TestUserResponseDto {
  const { password: _password, ...result } = user;
  return result;
}
