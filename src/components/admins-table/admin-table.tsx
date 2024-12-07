'use client';

import { DataTable } from '../ui/data-table';
import { columns } from './columns';
import { useState } from 'react';
import { getAdmins } from '@/services/adminService';
import { getSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import TableSkeleton from '../table-skeleton';

export default function AdminTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admins', pageIndex, pageSize],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;

      if (!token) return { data: [], totalPages: 0 };
      const res = await getAdmins(token, {
        page: pageIndex + 1,
        limit: pageSize,
      });
      return res;
    },
    staleTime: 60000,
  });

  if (isError) return <div>Error loading admins</div>;
  console.log(data);

  return (
    <div>
      {isLoading ? (
        <TableSkeleton rows={pageSize} columns={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={data || []}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={Math.ceil(data?.length / pageSize)}
        />
      )}
    </div>
  );
}
