'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getNeurologicas } from '@/services/neurologicaService';
import { getSession } from 'next-auth/react';
import TableSkeleton from '@/components/table-skeleton';

export default function NeurologicaTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['neurologicas', pageIndex, pageSize],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) return { neurologicas: [], total: 0 };

      return await getNeurologicas(token, {
        page: pageIndex + 1,
        limit: pageSize,
      });
    },
  });

  if (isError) return <div>Error cargando datos</div>;

  return isLoading ? (
    <TableSkeleton rows={pageSize} columns={columns.length} />
  ) : (
    <DataTable
      columns={columns}
      data={data?.neurologicas || []}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      pageSize={pageSize}
      setPageSize={setPageSize}
      totalPages={data?.total || 1}
    />
  );
}