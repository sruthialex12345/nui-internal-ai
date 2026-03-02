import { apiClient } from '@/lib';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '../types';

export async function createOrganization(data: CreateOrganizationDto): Promise<Organization> {
  return apiClient.post<Organization>('/organizations', data);
}

export async function updateOrganization(data: UpdateOrganizationDto): Promise<Organization> {
  const { id, ...updateData } = data;
  return apiClient.put<Organization>(`/organizations/${id}`, updateData);
}

export async function deleteOrganization(id: string): Promise<void> {
  return apiClient.delete<void>(`/organizations/${id}`);
}