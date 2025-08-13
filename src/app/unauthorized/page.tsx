import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center'>
      <h1 className='mb-4 text-2xl font-bold'>Acceso No Autorizado</h1>
      <p className='mb-8'>No tienes permiso para acceder a esta página.</p>
      <Link href='/'>
        <Button>Volver al Inicio</Button>
      </Link>
    </main>
  );
}
