'use client';

import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import { getManagers } from '@/services/managerService';
import { DataTable } from '../ui/data-table';
import { columns } from './columns';
import TableSkeleton from '../table-skeleton';

export default function ManagerTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['managers', pageIndex, pageSize],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;

      if (!token) return { users: [], total: 0 };
      const res = await getManagers(token, {
        page: pageIndex + 1,
        limit: pageSize,
      });

      return res;
    },
    staleTime: 60000,
  });

  if (isError) return <div>Error loading managers</div>;

  return (
    <div>
      {isLoading ? (
        <TableSkeleton rows={pageSize} columns={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.users || []}
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
