import LoginForm from '@/components/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className='mx-auto flex min-h-screen max-w-md flex-col justify-center'>
      <Image
        src='/logo-pucem.svg'
        alt='Logo'
        width={400}
        height={120}
        className='self-center'
      />
      <h1 className='mt-10 text-center text-5xl font-bold text-[#164284]'>
        Bienvenido
      </h1>
      <h2 className='mb-10 mt-2 text-center text-3xl text-[#575756]'>
        Ingrese su usuario y contraseña
      </h2>
      <LoginForm />
    </main>
  );
}
