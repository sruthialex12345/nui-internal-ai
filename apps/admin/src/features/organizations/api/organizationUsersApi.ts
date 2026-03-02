import { apiClient } from '@/lib';
import { OrganizationUser } from '../types';

export async function getOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
  return apiClient.get<OrganizationUser[]>(`/organizations/${organizationId}/users`);
}

export async function addUserToOrganization(
  organizationId: string,
  userId: string,
  role: 'admin' | 'member' | 'viewer'
): Promise<OrganizationUser> {
  return apiClient.post<OrganizationUser>(`/organizations/${organizationId}/users`, {
    userId,
    role,
  });
}

export async function removeUserFromOrganization(
  organizationId: string,
  userId: string
): Promise<void> {
  return apiClient.delete<void>(`/organizations/${organizationId}/users/${userId}`);
}