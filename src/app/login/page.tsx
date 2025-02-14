import LoginForm from '@/components/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className='mx-auto flex min-h-screen max-w-md flex-col justify-center'>
      <div className='self-center'>
        <Image
          src='/logo-pucem.svg' // Imagen para modo claro
          alt='Logo PUCE'
          width={400}
          height={120}
          priority
          className='block object-contain dark:hidden'
        />
        <Image
          src='/logo-pucem-white.png'
          alt='Logo PUCE Dark'
          width={400}
          height={120}
          priority
          className='hidden object-contain dark:block'
        />
      </div>

      <h1 className='mt-10 text-center text-5xl font-bold text-[#164284] dark:text-white'>
        Bienvenido
      </h1>
      <h2 className='mb-10 mt-2 text-center text-3xl text-[#575756] dark:text-white'>
        Ingrese su usuario y contraseña
      </h2>
      <LoginForm />
    </main>
  );
}
