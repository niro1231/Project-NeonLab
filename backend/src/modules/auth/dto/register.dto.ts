import { CreateUserDto } from '../../users/dto/create-user.dto.js';

/** Registering is just creating a user, so we reuse the same rules. */
export class RegisterDto extends CreateUserDto {}
