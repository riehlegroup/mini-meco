import bcrypt from 'bcryptjs';
import { DEFAULT_SALT_ROUNDS } from '../Config/constants';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, DEFAULT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}