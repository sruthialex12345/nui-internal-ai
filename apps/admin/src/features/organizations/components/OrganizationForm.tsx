import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@repo/ui/atoms';
import { Input } from '@repo/ui/atoms';
import { Form, FormItem, FormLabel, FormMessage } from '@repo/ui/atoms';
import { CreateOrganizationDto } from '../types';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100),
  description: z.string().max(500).optional(),
});

interface OrganizationFormProps {
  onSubmit: (data: CreateOrganizationDto) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function OrganizationForm({ onSubmit, onCancel, isLoading }: OrganizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationDto>({
    resolver: zodResolver(organizationSchema),
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormItem>
        <FormLabel htmlFor="name">Organization Name</FormLabel>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter organization name"
        />
        {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="description">Description (Optional)</FormLabel>
        <Input
          id="description"
          {...register('description')}
          placeholder="Enter organization description"
        />
        {errors.description && <FormMessage>{errors.description.message}</FormMessage>}
      </FormItem>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Organization'}
        </Button>
      </div>
    </Form>
  );
}