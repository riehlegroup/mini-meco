import bcrypt from 'bcryptjs';

const DEFAULT_SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, DEFAULT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}