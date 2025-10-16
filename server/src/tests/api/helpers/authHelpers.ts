import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Generates a JWT token for a given user ID
 */
export function generateToken(userId: number): string {
  return jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
}

/**
 * Creates an Authorization header with Bearer token
 */
export function createAuthHeader(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Generates a token for the test admin user (ID: 1)
 */
export function generateAdminToken(): string {
  return generateToken(1);
}

/**
 * Generates a token for the test regular user (ID: 2)
 */
export function generateUserToken(): string {
  return generateToken(2);
}
