import apiClient from './client';

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export const profileApi = {
  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData) => {
    const response = await apiClient.put('/api/v1/auth/me', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordData) => {
    const response = await apiClient.post('/api/v1/auth/change-password', data);
    return response.data;
  },
};
