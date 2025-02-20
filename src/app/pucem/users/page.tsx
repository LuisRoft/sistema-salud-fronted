'use client';

import { useSession } from 'next-auth/react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import TableSkeleton from '@/components/table-skeleton';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const teamData = session?.user?.team;
  const patient = teamData?.patient;

  if (status === 'loading') {
    return <TableSkeleton />;
  }

  if (!teamData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">No estás asignado a ningún equipo</h2>
        <p className="text-muted-foreground">Contacta a un administrador para ser asignado a un equipo.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-semibold mb-4">
        Equipo: {teamData.teamName}
      </h2>
      {patient ? (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground">Paciente asignado:</p>
          </div>
          <DataTable 
            columns={columns} 
            data={[patient]} 
          />
        </>
      ) : (
        <p className="text-muted-foreground">No hay paciente asignado a este equipo</p>
      )}
    </div>
  );
} 