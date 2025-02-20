'use client';

import { LoaderIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoaderIcon className='h-10 w-10 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex h-full items-center justify-center'>
      <Image
        src='/logo-vinculacion.jpeg'
        alt='PUC-EM'
        width={600}
        height={600}
        className='rounded-3xl'
      />
    </div>
  );
}
