import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { JwtPayload } from '../../common/types/auth-user.type.js';
import type { UserDocument } from '../users/schemas/user.schema.js';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

/** The result handed back to the controller: safe user data + a signed token. */
export interface AuthResult {
  user: Record<string, unknown>;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const user = await this.usersService.create(dto);
    return this.buildResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // Same message for "no such email" and "wrong password" so an attacker
    // cannot use the error to find out which emails are registered.
    const invalid = new UnauthorizedException('Invalid email or password');
    if (!user) {
      throw invalid;
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw invalid;
    }

    return this.buildResult(user);
  }

  private async buildResult(user: UserDocument): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id as string, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    // `toJSON()` runs the schema transform, which strips the password hash.
    return { user: user.toJSON() as unknown as Record<string, unknown>, token };
  }
}
