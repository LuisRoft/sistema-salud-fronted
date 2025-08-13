'use client';

import { useSession } from 'next-auth/react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import TableSkeleton from '@/components/table-skeleton';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const teamData = session?.user?.team;

  // Filtrar los pacientes excluyendo el array de cuidadores
  const patients = teamData?.patient
    ? Object.values(teamData.patient).filter(patient => 
        patient && typeof patient === 'object' && !Array.isArray(patient))
    : [];

  // 🔍 Log para verificar los datos recibidos después de filtrar
  console.log('Session Data:', session);
  console.log('Team Data:', teamData);
  console.log('Filtered Patients:', patients);

  if (status === 'loading') {
    return <TableSkeleton rows={0} columns={0} />;
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
      {patients.length > 0 ? (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground">Pacientes asignados:</p>
          </div>
          <DataTable 
            columns={columns} 
            data={patients} // ✅ Pasamos la lista de pacientes filtrada
            pageIndex={0}
            setPageIndex={() => {}}
            pageSize={10}
            setPageSize={() => {}}
            totalPages={1}
          />
        </>
      ) : (
        <p className="text-muted-foreground">No hay pacientes asignados a este equipo</p>
      )}
    </div>
  );
}
