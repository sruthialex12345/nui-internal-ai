import { Card } from '@repo/ui/atoms';
import { Badge } from '@repo/ui/atoms';
import { Organization } from '../types';

interface OrganizationCardProps {
  organization: Organization;
  onEdit?: (organization: Organization) => void;
  onDelete?: (id: string) => void;
}

export function OrganizationCard({ organization, onEdit, onDelete }: OrganizationCardProps) {
  const getStatusColor = (status: Organization['status']) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'pending': return 'yellow';
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {organization.name}
          </h3>
          {organization.description && (
            <p className="text-sm text-gray-600 mt-1">
              {organization.description}
            </p>
          )}
        </div>
        <Badge variant={getStatusColor(organization.status)}>
          {organization.status}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Created: {new Date(organization.createdAt).toLocaleDateString()}</span>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(organization)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(organization.id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}