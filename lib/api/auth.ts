import apiClient from './client';

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface RegisterWithInvitationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  invitation_code: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
  organization_id?: number;
}

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },

  /**
   * Register a new user with invitation code
   */
  registerWithInvitation: async (data: RegisterWithInvitationData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/register-with-invitation', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', data);
    return response.data;
  },

  /**
   * Get current user
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },
};

