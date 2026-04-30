import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

type RequestWithUser = Request & { user?: AuthUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user as AuthUser;
  },
);
