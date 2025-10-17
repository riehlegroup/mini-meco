/**
 * API response type definitions
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
  githubUsername?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
