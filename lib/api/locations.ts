import apiClient from './client';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: number;
  organization_id: number;
  organization_name: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  full_address: string;
  phone: string;
  email: string;
  coordinates?: Coordinates;
  has_coordinates: boolean;
  is_active: boolean;
  geocoded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationData {
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
}

export interface UpdateLocationData extends CreateLocationData {}

export const locationsApi = {
  /**
   * Get organization locations
   */
  getLocations: async (organizationId: number): Promise<Location[]> => {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/locations`);
    // Backend returns {count: number, results: Location[]}
    return response.data.results || response.data;
  },

  /**
   * Get location by ID
   */
  getLocation: async (organizationId: number, locationId: number): Promise<Location> => {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/locations/${locationId}`);
    return response.data;
  },

  /**
   * Create new location
   */
  createLocation: async (organizationId: number, data: CreateLocationData): Promise<Location> => {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/locations`, data);
    return response.data;
  },

  /**
   * Update location
   */
  updateLocation: async (
    organizationId: number,
    locationId: number,
    data: UpdateLocationData
  ): Promise<Location> => {
    const response = await apiClient.patch(
      `/api/v1/organizations/${organizationId}/locations/${locationId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete location
   */
  deleteLocation: async (organizationId: number, locationId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/locations/${locationId}`);
  },
};
