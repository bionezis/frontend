import apiClient from './client';

export interface ProgramType {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: number;
  organization_id: number;
  organization_name: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  brochure_url?: string;
  language: 'en' | 'pl' | 'nl' | 'fr' | 'de' | 'es';
  program_type: ProgramType;
  duration_minutes: number;
  benefits: string;
  requirements: string;
  target_audience_age_min?: number;
  target_audience_age_max?: number;
  target_audience_gender: 'all' | 'male' | 'female' | 'non_binary' | 'other';
  status: 'draft' | 'approved' | 'published' | 'archived';
  is_published: boolean;
  offering_count: number;
  approved_by_email?: string;
  approved_at?: string;
  published_at?: string;
  created_by_email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramData {
  name: string;
  description: string;
  short_description?: string;
  language: 'en' | 'pl' | 'nl' | 'fr' | 'de' | 'es';
  program_type_id: number;
  duration_minutes: number;
  benefits?: string;
  requirements?: string;
  target_audience_age_min?: number;
  target_audience_age_max?: number;
  target_audience_gender: 'all' | 'male' | 'female' | 'non_binary' | 'other';
  brochure?: File;
}

export interface UpdateProgramData extends Omit<CreateProgramData, 'brochure'> {
  brochure?: File;
}

export interface LocationInfo {
  id: number;
  name: string;
  city: string;
  country: string;
  address: string;
}

export interface ProgramOffering {
  id: number;
  program_id: number;
  program_name: string;
  location: LocationInfo;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  pricing_type: 'free' | 'paid' | 'sliding_scale' | 'insurance' | 'contact';
  price?: number;
  currency?: string;
  pricing_details?: string;
  schedule_info?: string;
  capacity?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferingData {
  location_id: number;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  pricing_type: 'free' | 'paid' | 'sliding_scale' | 'insurance' | 'contact';
  price?: number;
  currency?: string;
  pricing_details?: string;
  schedule_info?: string;
  capacity?: number;
  notes?: string;
}

export interface UpdateOfferingData extends CreateOfferingData {}

export const programsApi = {
  /**
   * Get all program types
   */
  getProgramTypes: async (): Promise<ProgramType[]> => {
    const response = await apiClient.get('/api/v1/program-types');
    return response.data.results || response.data;
  },

  /**
   * Get organization programs
   */
  getPrograms: async (organizationId: number): Promise<Program[]> => {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/programs`);
    // Backend returns {count: number, results: Program[]}
    return response.data.results || response.data;
  },

  /**
   * Get program by ID
   */
  getProgram: async (organizationId: number, programId: number): Promise<Program> => {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/programs/${programId}`);
    return response.data;
  },

  /**
   * Create new program
   */
  createProgram: async (organizationId: number, data: CreateProgramData): Promise<Program> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (data.short_description) {
      formData.append('short_description', data.short_description);
    }
    formData.append('language', data.language);
    formData.append('program_type_id', data.program_type_id.toString());
    formData.append('duration_minutes', data.duration_minutes.toString());
    if (data.benefits) {
      formData.append('benefits', data.benefits);
    }
    if (data.requirements) {
      formData.append('requirements', data.requirements);
    }
    if (data.target_audience_age_min) {
      formData.append('target_audience_age_min', data.target_audience_age_min.toString());
    }
    if (data.target_audience_age_max) {
      formData.append('target_audience_age_max', data.target_audience_age_max.toString());
    }
    formData.append('target_audience_gender', data.target_audience_gender);
    if (data.brochure) {
      formData.append('brochure', data.brochure);
    }

    const response = await apiClient.post(
      `/api/v1/organizations/${organizationId}/programs`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Update program
   */
  updateProgram: async (
    organizationId: number,
    programId: number,
    data: UpdateProgramData
  ): Promise<Program> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (data.short_description) {
      formData.append('short_description', data.short_description);
    }
    formData.append('language', data.language);
    formData.append('program_type_id', data.program_type_id.toString());
    formData.append('duration_minutes', data.duration_minutes.toString());
    if (data.benefits) {
      formData.append('benefits', data.benefits);
    }
    if (data.requirements) {
      formData.append('requirements', data.requirements);
    }
    if (data.target_audience_age_min) {
      formData.append('target_audience_age_min', data.target_audience_age_min.toString());
    }
    if (data.target_audience_age_max) {
      formData.append('target_audience_age_max', data.target_audience_age_max.toString());
    }
    formData.append('target_audience_gender', data.target_audience_gender);
    if (data.brochure) {
      formData.append('brochure', data.brochure);
    }

    const response = await apiClient.patch(
      `/api/v1/organizations/${organizationId}/programs/${programId}`,
      formData
    );
    return response.data;
  },

  /**
   * Delete program
   */
  deleteProgram: async (organizationId: number, programId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/programs/${programId}`);
  },

  /**
   * Approve program (admin only)
   */
  approveProgram: async (organizationId: number, programId: number): Promise<Program> => {
    const response = await apiClient.post(
      `/api/v1/organizations/${organizationId}/programs/${programId}/approve`
    );
    return response.data;
  },

  /**
   * Publish program
   */
  publishProgram: async (organizationId: number, programId: number): Promise<Program> => {
    const response = await apiClient.post(
      `/api/v1/organizations/${organizationId}/programs/${programId}/publish`
    );
    return response.data;
  },

  /**
   * Unpublish program
   */
  unpublishProgram: async (organizationId: number, programId: number): Promise<Program> => {
    const response = await apiClient.post(
      `/api/v1/organizations/${organizationId}/programs/${programId}/unpublish`
    );
    return response.data;
  },

  /**
   * Get program offerings
   */
  getProgramOfferings: async (organizationId: number, programId: number): Promise<ProgramOffering[]> => {
    const response = await apiClient.get(
      `/api/v1/organizations/${organizationId}/programs/${programId}/offerings`
    );
    // Backend returns {count: number, results: ProgramOffering[]}
    return response.data.results || response.data;
  },

  /**
   * Create program offering
   */
  createOffering: async (
    organizationId: number,
    programId: number,
    data: CreateOfferingData
  ): Promise<ProgramOffering> => {
    const response = await apiClient.post(
      `/api/v1/organizations/${organizationId}/programs/${programId}/offerings`,
      data
    );
    return response.data;
  },

  /**
   * Update program offering
   */
  updateOffering: async (
    organizationId: number,
    programId: number,
    offeringId: number,
    data: UpdateOfferingData
  ): Promise<ProgramOffering> => {
    const response = await apiClient.patch(
      `/api/v1/organizations/${organizationId}/programs/${programId}/offerings/${offeringId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete program offering
   */
  deleteOffering: async (
    organizationId: number,
    programId: number,
    offeringId: number
  ): Promise<void> => {
    await apiClient.delete(
      `/api/v1/organizations/${organizationId}/programs/${programId}/offerings/${offeringId}`
    );
  },
};
