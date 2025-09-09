import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from '../decorators/roles.decorator';
  import { UserRole } from '../../common/user-role.enum';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
        // retrieve roles defined in decorator
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
    
        // open route to all authenticated users
        if (!requiredRoles) return true;
    
        const { user } = context.switchToHttp().getRequest();
    
        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('You do not have access to this resource');
        }
    
        return true;
    }
  }
  