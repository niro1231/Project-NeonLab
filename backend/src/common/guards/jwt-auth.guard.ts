import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AUTH_COOKIE,
  type JwtPayload,
  type RequestWithUser,
} from '../types/auth-user.type.js';

/**
 * Blocks a route unless the request carries a valid JWT cookie.
 * On success it attaches `{ userId, email }` to the request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token: string | undefined = request.cookies?.[AUTH_COOKIE];

    if (!token) {
      throw new UnauthorizedException('You are not logged in');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = { userId: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Your session is invalid or has expired');
    }
  }
}
