import { apiClient } from './apiClient';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface ProfileResponse {
  status: string;
  data: {
    user: User;
  };
}

export const authService = {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });

    // Store token
    apiClient.setToken(response.data.token);

    return response;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    // Store token
    apiClient.setToken(response.data.token);

    return response;
  },

  async getProfile(): Promise<ProfileResponse> {
    return apiClient.get<ProfileResponse>('/auth/profile');
  },

  async updateProfile(name: string): Promise<ProfileResponse> {
    return apiClient.put<ProfileResponse>('/auth/profile', { name });
  },

  logout() {
    apiClient.setToken(null);
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },
};
