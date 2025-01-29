import CaregiverTable from '@/components/caregivers-table/caregivers-table';
import CreateCaregiversDialog from '@/components/caregivers-table/create-caregivers-dialog';

export default function CaretakersPage() {
  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='py-6 text-xl font-bold'>Manejo de Cuidadores</h1>
        <CreateCaregiversDialog />
      </div>
      <CaregiverTable />
    </div>
  );
}
