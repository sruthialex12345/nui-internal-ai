import { useQuery } from '@tanstack/react-query';
import { getOrganizations, getOrganization } from '../api';

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: getOrganizations,
  });
}

export function useOrganizationQuery(id: string) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => getOrganization(id),
    enabled: !!id,
  });
}