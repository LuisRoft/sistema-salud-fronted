'use client';

import { DataTable } from '../ui/data-table';
import { columns } from './columns';
import { useState } from 'react';
import { getCaregivers } from '@/services/caregiverService';
import { getSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import TableSkeleton from '../table-skeleton';

export default function CaregiverTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['caregivers', pageIndex, pageSize],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;

      const res = await getCaregivers(token as string, pageSize, pageIndex + 1);

      return res;
    },
    staleTime: 60000, // Los datos permanecen frescos por 60 segundos
  });

  if (isError) return <div>Error cargando la lista de cuidadores</div>;

  return (
    <div className="w-full overflow-x-auto">
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <TableSkeleton rows={pageSize} columns={columns.length} />
        ) : (
          <DataTable
            columns={columns}
            data={data?.caregivers || []}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={Math.ceil((data?.total || 0) / pageSize)}
          />
        )}
      </div>
    </div>
  );
}
