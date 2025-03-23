'use client';

import { LoaderIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';

const fetcher = async (url: string | URL | Request, token: any) => {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
};

export default function Page() {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();

  const token = session?.user.access_token;

  const { data: users } = useSWR(token ? ['http://localhost:3000/api/users/role/user', token] : null, fetcher);
  const { data: careers } = useSWR(token ? ['http://localhost:3000/api/careers', token] : null, fetcher);
  const { data: patients } = useSWR(token ? ['http://localhost:3000/api/patients', token] : null, fetcher);
  const { data: teams } = useSWR(token ? ['http://localhost:3000/api/teams', token] : null, fetcher);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  if (status === 'loading' || !users || !careers || !patients || !teams) {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoaderIcon className='h-10 w-10 animate-spin' />
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-blue-400 p-4 rounded-lg'>
          <h3 className='font-bold'>Total Gestores</h3>
          <p className='text-2xl'>{users?.length || 0}</p>
        </div>
        <div className='bg-green-400 p-4 rounded-lg'>
          <h3 className='font-bold'>Total Carreras</h3>
          <p className='text-2xl'>{careers?.length || 0}</p>
        </div>
        <div className='bg-yellow-400 p-4 rounded-lg'>
          <h3 className='font-bold'>Total Usuarios</h3>
          <p className='text-2xl'>{patients?.length || 0}</p>
        </div>
        <div className='bg-purple-400 p-4 rounded-lg'>
          <h3 className='font-bold'>Total Equipos</h3>
          <p className='text-2xl'>{teams?.length || 0}</p>
        </div>
      </div>

      <div className='flex h-full items-center justify-center'>
        <Image
          src='/logo-vinculacion.jpeg'
          alt='PUC-EM'
          width={400}
          height={400}
          className='rounded-3xl'
        />
      </div>
    </div>
  );
}