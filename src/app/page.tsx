import { redirect } from 'next/navigation';
import { authOptions } from './api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export default async function Home() {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);

  if (session) {
    // Redirigir según el rol del usuario
    if (session.user.role === 'admin') {
      redirect('/dashboard');
    } else if (session.user.role === 'user') {
      redirect('/pucem');
    }
  } else {
    // Si no hay sesión, redirigir al login
    redirect('/login');
  }
}
