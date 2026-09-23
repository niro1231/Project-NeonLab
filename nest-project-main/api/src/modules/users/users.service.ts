import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { Model, isValidObjectId } from 'mongoose';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import { User, type UserDocument } from './schemas/user.schema.js';

const SALT_ROUNDS = 10;

/** All database work for users lives here. Controllers stay thin. */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Creates a user with a hashed password. */
  async create(dto: CreateUserDto): Promise<UserDocument> {
    await this.assertEmailIsFree(dto.email);

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      return await this.userModel.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });
    } catch (error) {
      // Safety net for two identical signups arriving at the same moment.
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }
  }

  /** Everyone in the system, newest first. Passwords are never included. */
  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Used only by login - `+password` asks Mongoose for the hidden hash
   * so we can compare it with what the user typed.
   */
  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    if (dto.email) {
      await this.assertEmailIsFree(dto.email, id);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }

  /** Throws if the email is already taken by someone other than `exceptId`. */
  private async assertEmailIsFree(
    email: string,
    exceptId?: string,
  ): Promise<void> {
    const existing = await this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();

    if (existing && existing.id !== exceptId) {
      throw new ConflictException('An account with this email already exists');
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 11000
    );
  }
}
