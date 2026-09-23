import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser, RequestWithUser } from '../types/auth-user.type.js';

/**
 * Shortcut for reading the logged-in user in a controller:
 *   `myProfile(@CurrentUser() user: AuthUser) { ... }`
 * Only works on routes protected by JwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user as AuthUser;
  },
);
