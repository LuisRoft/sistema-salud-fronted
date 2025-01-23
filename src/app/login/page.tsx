import LoginForm from '@/components/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center">
      {/* Imagen para modo claro y oscuro */}
      <div className="self-center">
        <Image
          src='/logo-pucem.svg' // Imagen para modo claro
          alt='Logo PUCE'
          width={400}
          height={120}
          priority
          className="block dark:hidden object-contain"
        />
        <Image
          src='/logo-pucem-white.png' // Imagen para modo oscuro con letras blancas
          alt='Logo PUCE Dark'
          width={400}
          height={120}
          priority
          className="hidden dark:block object-contain"
        />
      </div>

      <h1 className="dark:text-white mt-10 text-center text-5xl font-bold text-[#164284]">
        Bienvenido
      </h1>
      <h2 className="dark:text-white mb-10 mt-2 text-center text-3xl text-[#575756]">
        Ingrese su usuario y contraseña
      </h2>
      <LoginForm />
    </main>
  );
}
