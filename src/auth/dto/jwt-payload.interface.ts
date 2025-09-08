import { UserRole } from "src/common/user-role.enum";

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: UserRole
}
