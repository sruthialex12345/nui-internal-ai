import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrganization, updateOrganization, deleteOrganization } from '../api';
import type { CreateOrganizationDto, UpdateOrganizationDto } from '../types';

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationDto) => createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationDto) => updateOrganization(data),
    onSuccess: (updatedOrganization) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.setQueryData(['organizations', updatedOrganization.id], updatedOrganization);
    },
  });
}

export function useDeleteOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}