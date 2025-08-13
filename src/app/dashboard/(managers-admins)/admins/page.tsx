import CreateAdminDialog from '@/components/admins-table/create-admin-dialog';
import AdminsTable from '@/components/admins-table/admin-table';

export default async function AdminsPage() {
  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='py-6 text-xl font-bold'>Manejo de Administradores</h1>
        <CreateAdminDialog />
      </div>
      <AdminsTable />
    </div>
  );
}
