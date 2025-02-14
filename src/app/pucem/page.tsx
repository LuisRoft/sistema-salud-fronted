'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LoaderIcon } from 'lucide-react';

export default function PucemPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading')
    return (
      <div className='flex h-full items-center justify-center'>
        <LoaderIcon className='h-10 w-10 animate-spin' />
      </div>
    );
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
