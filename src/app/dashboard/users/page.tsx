import CreateUserDialog from '@/components/users-table/create-user-dialog';

export default function UsersPage() {
  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='py-6 text-xl font-bold'>Manejo de Usuarios</h1>
        <CreateUserDialog />
      </div>
    </div>
  );
}
