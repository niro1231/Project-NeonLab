import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import {
  authCookieOptions,
  clearCookieOptions,
} from '../../common/cookie.options.js';
import {
  AUTH_COOKIE,
  type AuthUser,
} from '../../common/types/auth-user.type.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /** POST /api/auth/register */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, token } = await this.authService.register(dto);
    response.cookie(AUTH_COOKIE, token, authCookieOptions());
    return { user };
  }

  /** POST /api/auth/login */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, token } = await this.authService.login(dto);
    response.cookie(AUTH_COOKIE, token, authCookieOptions());
    return { user };
  }

  /** POST /api/auth/logout - simply removes the cookie. */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE, clearCookieOptions());
    return { message: 'Logged out' };
  }

  /** GET /api/auth/me - lets the frontend check who is logged in. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.userId);
  }
}
