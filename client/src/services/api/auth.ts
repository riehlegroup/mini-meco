import ApiClient from "./client";
import { LoginResponse, RegisterResponse } from "@/types/api";

/**
 * Authentication API methods
 */
const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return ApiClient.getInstance().post<LoginResponse>("/session", {
      email,
      password,
    });
  },

  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<RegisterResponse> => {
    return ApiClient.getInstance().post<RegisterResponse>("/user", {
      email,
      password,
      name,
    });
  },

  forgotPassword: async (email: string): Promise<{ success: boolean }> => {
    return ApiClient.getInstance().post<{ success: boolean }>(
      "/user/forgotPassword",
      { email }
    );
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean }> => {
    return ApiClient.getInstance().post<{ success: boolean }>(
      "/user/resetPassword",
      { token, newPassword }
    );
  },

  confirmEmail: async (token: string): Promise<{ success: boolean }> => {
    return ApiClient.getInstance().post<{ success: boolean }>(
      "/user/confirmedEmail",
      { token }
    );
  },
};

export default authApi;
