import CreateManagerDialog from '@/components/managers-table/create-manager-dialog';
import ManagerTable from '@/components/managers-table/manager-table';

export default function ManagersPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="py-6 text-xl font-bold">Manejo de Gestores</h1>
        <CreateManagerDialog />
      </div>
      <ManagerTable />
    </div>
  );
}
