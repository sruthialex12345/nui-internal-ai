import { useState } from 'react';
import { Button } from '@repo/ui/atoms';
import { OrganizationCard } from '@/features/organizations';
import type { Organization } from '@/features/organizations/types';

export function OrganizationsPage() {
  const [organizations] = useState<Organization[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      description: 'A leading technology company',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
    },
    {
      id: '2',
      name: 'Global Finance Inc',
      description: 'Financial services provider',
      status: 'pending',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-18T11:30:00Z',
    },
    {
      id: '3',
      name: 'Tech Innovations LLC',
      description: 'Software development company',
      status: 'inactive',
      createdAt: '2023-12-05T16:20:00Z',
      updatedAt: '2024-01-05T12:00:00Z',
    },
  ]);

  const handleEditOrganization = (organization: Organization) => {
    console.log('Edit organization:', organization);
  };

  const handleDeleteOrganization = (id: string) => {
    console.log('Delete organization:', id);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Organizations
            </h1>
            <p className="text-lg text-gray-600">
              Manage organizations and their settings
            </p>
          </div>
          <Button>
            Add Organization
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((organization) => (
          <OrganizationCard
            key={organization.id}
            organization={organization}
            onEdit={handleEditOrganization}
            onDelete={handleDeleteOrganization}
          />
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No organizations found
          </p>
          <Button>
            Create your first organization
          </Button>
        </div>
      )}
    </div>
  );
}