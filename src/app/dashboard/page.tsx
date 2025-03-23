'use client';

import { LoaderIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const fetchAllData = async (token: any) => {
  const headers = { Authorization: `Bearer ${token}` };
  const [usersRes, careersRes, patientsRes, teamsRes] = await Promise.all([
    fetch('http://localhost:3000/api/users/role/user', { headers }).then((res) => res.json()),
    fetch('http://localhost:3000/api/careers', { headers }).then((res) => res.json()),
    fetch('http://localhost:3000/api/patients', { headers }).then((res) => res.json()),
    fetch('http://localhost:3000/api/teams', { headers }).then((res) => res.json()),
  ]);

  return {
    users: usersRes.users || usersRes,
    careers: careersRes.careers || careersRes,
    patients: patientsRes.patients || patientsRes,
    teams: teamsRes.teams || teamsRes,
  };
};

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState({ users: [], careers: [], patients: [], teams: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const result = await fetchAllData(session.user.access_token);
      setData(result);
      setLoading(false);
    };

    loadData();
  }, [session, status, router]);

  if (loading || status === 'loading') {
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
          <p className='text-2xl'>{data.users?.length || 0}</p>
        </div>
        <div className='bg-green-400 p-4 rounded-lg'>
          <h3 className='font-bold'>Total Carreras</h3>
          <p className='text-2xl'>{data.careers?.length || 0}</p>
        </div>
        <div className='bg-yellow-400 p-4 rounded-lg'>
          <h3 className='font-bold'>Total Usuarios</h3>
          <p className='text-2xl'>{data.patients?.length || 0}</p>
        </div>
        <div className='bg-purple-400 p-4 rounded-lg'>
          <h3 className='font-bold'>Total Equipos</h3>
          <p className='text-2xl'>{data.teams?.length || 0}</p>
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