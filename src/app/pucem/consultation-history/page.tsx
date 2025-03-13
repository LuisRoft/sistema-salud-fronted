'use client';

import ConsultationHistoryTable from '@/components/consultation-history/consultation-history-table';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderIcon } from 'lucide-react';

export default function ConsultationHistoryPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoaderIcon className='h-10 w-10 animate-spin' />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between">
        <h1 className="py-6 text-xl font-bold">Historial de Consultas</h1>
      </div>
      <ConsultationHistoryTable />
    </div>
  );
}
