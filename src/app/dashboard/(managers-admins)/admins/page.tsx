import CreateAdminDialog from '@/components/admins-table/create-admin-dialog';
import AdminsTable from '@/components/admins-table/admin-table';

export default async function AdminsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Manejo de Administradores</h1>
        <CreateAdminDialog />
      </div>
      <AdminsTable />
    </div>
  );
}
