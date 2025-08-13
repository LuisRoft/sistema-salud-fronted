'use client';

import { DataTable } from '../ui/data-table';
import { columns } from './columns';
import { useState } from 'react';
import { getSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import TableSkeleton from '../table-skeleton';
import { getLaboratoryRequests } from '@/services/labRequestService';
import { LabRequestRow } from '@/components/lab-request/columns';

export default function LabRequestTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lab-requests', pageIndex, pageSize],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;

      if (!token) return { requests: [], total: 0 };

      const requests: LabRequestRow[] = await getLaboratoryRequests(token);

      return { requests, total: requests.length };
    },
    staleTime: 60000,
  });

  if (isError) return <div>Error al cargar las solicitudes de laboratorio</div>;

  return (
    <div>
      {isLoading ? (
        <TableSkeleton rows={pageSize} columns={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.requests || []}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={Math.ceil((data?.total || 1) / pageSize)}
        />
      )}
    </div>
  );
}
