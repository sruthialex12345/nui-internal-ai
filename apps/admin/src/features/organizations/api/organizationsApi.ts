import { apiClient } from '@/lib';
import { Organization } from '../types';

export async function getOrganizations(): Promise<Organization[]> {
  return apiClient.get<Organization[]>('/organizations');
}

export async function getOrganization(id: string): Promise<Organization> {
  return apiClient.get<Organization>(`/organizations/${id}`);
}