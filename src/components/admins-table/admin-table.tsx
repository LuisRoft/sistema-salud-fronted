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

      if (!token) return { admins: [], total: 0 };
      const res = await getAdmins(token, {
        page: pageIndex + 1,
        limit: pageSize,
      });

      return res;
    },
    staleTime: 60000,
  });

  if (isError) return <div>Error loading admins</div>;

  return (
    <div className="w-full">
      {isLoading ? (
        <TableSkeleton rows={pageSize} columns={columns.length} />
      ) : (
        <div className="w-full overflow-hidden">
          <DataTable
            columns={columns}
            data={data?.admins || []}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={Math.ceil((data?.total || 1) / pageSize)}
          />
        </div>
      )}
    </div>
  );
}
