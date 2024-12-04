import { Skeleton } from './ui/skeleton';

export default function TableSkeleton({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) {
  console.log(rows, columns);
  return (
    <div className='w-full space-y-3'>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className='flex space-x-4'>
          {Array.from({ length: columns }).map((_, colIndex) =>
            colIndex === columns - 1 ? (
              <Skeleton key={colIndex} className='h-8 w-[100px] rounded' />
            ) : (
              <Skeleton key={colIndex} className='h-8 w-[200px] rounded' />
            )
          )}
        </div>
      ))}
    </div>
  );
}
