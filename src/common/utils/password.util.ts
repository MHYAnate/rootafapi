import * as bcrypt from 'bcryptjs';

export class PasswordUtil {
  static async hash(password: string, rounds: number = 12): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  static async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}