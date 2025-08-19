import CaregiverTable from '@/components/caregivers-table/caregivers-table';
import CreateCaregiversDialog from '@/components/caregivers-table/create-caregivers-dialog';

export default function CaretakersPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Manejo de Cuidadores</h1>
        <CreateCaregiversDialog />
      </div>
      <CaregiverTable />
    </div>
  );
}
