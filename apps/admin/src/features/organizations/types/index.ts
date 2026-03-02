export interface Organization {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
}

export interface UpdateOrganizationDto {
  id: string;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface OrganizationUser {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  email: string;
  name: string;
  createdAt: string;
}