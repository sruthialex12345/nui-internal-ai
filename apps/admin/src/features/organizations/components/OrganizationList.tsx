import { OrganizationCard } from './OrganizationCard';
import { Organization } from '../types';

interface OrganizationListProps {
  organizations: Organization[];
  onEdit?: (organization: Organization) => void;
  onDelete?: (id: string) => void;
}

export function OrganizationList({ organizations, onEdit, onDelete }: OrganizationListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {organizations.map((organization) => (
        <OrganizationCard
          key={organization.id}
          organization={organization}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}