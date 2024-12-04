'use client';

import { DataTable } from '../ui/data-table';
import { columns } from './columns';
import { useState } from 'react';
import { getUsers } from '@/services/userService';
import { getSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import TableSkeleton from '../table-skeleton';

export default function UserTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', pageIndex, pageSize],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;

      if (!token) return { data: [], totalPages: 0 };
      const res = await getUsers(token, {
        page: pageIndex + 1,
        limit: pageSize,
      });
      return res.UserPaginated;
    },
    staleTime: 5000,
  });

  if (isError) return <div>Error loading users</div>;

  return (
    <div>
      {isLoading ? (
        <TableSkeleton rows={pageSize} columns={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={data?.totalPages || 0}
        />
      )}
    </div>
  );
}
