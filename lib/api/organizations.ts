import apiClient from './client';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  is_approved: boolean;
  member_count: number;
  owner_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: File;
}

export interface UpdateOrganizationData extends CreateOrganizationData {}

export interface OrganizationMember {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  organization_id: number;
  organization_name: string;
  role: 'owner' | 'admin' | 'member';
  is_active: boolean;
  joined_at: string;
  updated_at: string;
}

export const organizationsApi = {
  /**
   * Get user's organizations
   */
  getMyOrganizations: async (): Promise<Organization[]> => {
    const response = await apiClient.get('/api/v1/organizations');
    // Backend returns {count: number, results: Organization[]}
    return response.data.results || response.data;
  },

  /**
   * Get organization by ID
   */
  getOrganization: async (id: number): Promise<Organization> => {
    const response = await apiClient.get(`/api/v1/organizations/${id}`);
    return response.data;
  },

  /**
   * Create new organization
   */
  createOrganization: async (data: CreateOrganizationData, logo?: File): Promise<Organization> => {
    if (logo) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('country', data.country);
      if (data.postal_code) formData.append('postal_code', data.postal_code);
      if (data.phone) formData.append('phone', data.phone);
      if (data.email) formData.append('email', data.email);
      if (data.website) formData.append('website', data.website);
      formData.append('logo', logo);
      
      const response = await apiClient.post('/api/v1/organizations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.post('/api/v1/organizations', data);
      return response.data;
    }
  },

  /**
   * Update organization
   */
  updateOrganization: async (id: number, data: UpdateOrganizationData, logo?: File): Promise<Organization> => {
    if (logo) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('country', data.country);
      if (data.postal_code) formData.append('postal_code', data.postal_code);
      if (data.phone) formData.append('phone', data.phone);
      if (data.email) formData.append('email', data.email);
      if (data.website) formData.append('website', data.website);
      formData.append('logo', logo);
      
      const response = await apiClient.patch(`/api/v1/organizations/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.patch(`/api/v1/organizations/${id}`, data);
      return response.data;
    }
  },

  /**
   * Delete organization (owner only)
   */
  deleteOrganization: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/organizations/${id}`);
  },

  /**
   * Get organization members
   */
  getOrganizationMembers: async (id: number): Promise<OrganizationMember[]> => {
    const response = await apiClient.get(`/api/v1/organizations/${id}/members`);
    return response.data;
  },

  /**
   * Invite member to organization
   */
  inviteMember: async (organizationId: number, data: {
    email: string;
    first_name?: string;
    last_name?: string;
    role?: 'owner' | 'admin' | 'member';
  }): Promise<void> => {
    await apiClient.post(`/api/v1/organizations/${organizationId}/invites`, data);
  },

  /**
   * Remove member from organization
   */
  removeMember: async (organizationId: number, memberId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/members/${memberId}`);
  },
};
