import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
}

export function DataTablePagination<TData>({
  pageIndex,
  setPageIndex,
  pageSize,
  setPageSize,
  totalPages,
}: DataTablePaginationProps<TData>) {
  return (
    <div className='flex items-center justify-between px-2'>
      <div className='flex-1 text-sm'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Filas por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPageIndex(0); // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
        Página {pageIndex + 1} de {Math.max(1, totalPages)}
      </div>
      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={() => setPageIndex(0)}
          disabled={pageIndex === 0}
        >
          <DoubleArrowLeftIcon className='h-4 w-4' />
        </Button>
        <Button
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          <ChevronLeftIcon className='h-4 w-4' />
        </Button>
        <Button
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={pageIndex >= totalPages - 1}
        >
          <ChevronRightIcon className='h-4 w-4' />
        </Button>
        <Button
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={() => setPageIndex(totalPages - 1)}
          disabled={pageIndex >= totalPages - 1}
        >
          <DoubleArrowRightIcon className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
