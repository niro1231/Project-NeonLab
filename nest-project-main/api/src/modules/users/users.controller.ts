import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { clearCookieOptions } from '../../common/cookie.options.js';
import {
  AUTH_COOKIE,
  type AuthUser,
} from '../../common/types/auth-user.type.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

/** Every route here needs a valid auth cookie. */
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /api/users - list all users. */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /** GET /api/users/me - the logged-in user's own profile. */
  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.userId);
  }

  /** PATCH /api/users/me - update own name / email. */
  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.userId, dto);
  }

  /** DELETE /api/users/me - delete own account and log out. */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async removeMe(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.usersService.remove(user.userId);
    response.clearCookie(AUTH_COOKIE, clearCookieOptions());
    return { message: 'Your account has been deleted' };
  }

  /**
   * GET /api/users/:id - view a single user.
   * Declared last so that `/users/me` is matched first.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
