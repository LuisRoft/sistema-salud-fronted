'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useState } from 'react';
import { getSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import TableSkeleton from '@/components/table-skeleton';
import { getPatients } from '@/services/patientService';

export default function UserTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', pageIndex, pageSize],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await getPatients(token as string, {
        limit: pageSize,
        page: pageIndex + 1,
      });
    },
    staleTime: 60000,
  });

  if (isError) return <div className="text-red-500 text-center">Error cargando la lista de usuarios</div>;

  return (
    <div className="w-full overflow-x-auto">
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <TableSkeleton rows={pageSize} columns={columns.length} />
        ) : (
          <DataTable
            columns={columns}
            data={data?.patients || []}
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
