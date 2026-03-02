import { createFileRoute } from '@tanstack/react-router';
import { OrganizationsPage } from '@/pages/organizations/OrganizationsPage';

export const Route = createFileRoute('/organizations/')({
  component: OrganizationsPage,
});