import CreateManagerDialog from '@/components/managers-table/create-manager-dialog';
import ManagerTable from '@/components/managers-table/manager-table';

export default function ManagersPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Manejo de Gestores</h1>
        <CreateManagerDialog />
      </div>
      <ManagerTable />
    </div>
  );
}
