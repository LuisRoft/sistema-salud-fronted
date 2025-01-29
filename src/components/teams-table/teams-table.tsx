'use client';

import { DataTable } from '../ui/data-table';
import { columns } from './columns';
import { useState } from 'react';
import { getTeams } from '@/services/teamsService';
import { getSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import TableSkeleton from '../table-skeleton';

export default function TeamsTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['teams', pageIndex, pageSize],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      const teamsData = await getTeams(token as string, {
        limit: pageSize,
        page: pageIndex + 1,
      });

      return teamsData;
    },

    staleTime: 60000, // Los datos se consideran frescos durante 60 segundos
  });

  if (isError) return <div>Error loading teams</div>;

  return (
    <div>
      {isLoading ? (
        <TableSkeleton rows={pageSize} columns={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.teams || []}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={Math.ceil((data?.total || 0) / pageSize)}
        />
      )}
    </div>
  );
}
