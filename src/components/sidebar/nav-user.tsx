'use client';

import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { signOut, useSession } from 'next-auth/react';

export function NavUser() {
  const { data: session } = useSession();
  console.log(session?.user)
  // Obtener iniciales del nombre y apellido
  const getInitials = (name = '', lastName = '') => {
    const firstInitial = name.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const userInitials = getInitials(session?.user.name, session?.user.lastName);

  return (
    <SidebarMenu>
      {/* Botón para cerrar sesión */}
      <SidebarMenuItem>
        <div className="flex justify-center mb-4">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 dark:text-black dark:bg-red-400 dark:hover:bg-red-500"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </SidebarMenuItem>

      {/* Información del usuario */}
      <SidebarMenuItem>
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-md dark:bg-gray-800">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={session?.user.image || ''}
              alt={`${session?.user.name} ${session?.user.lastName}`}
            />
            <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            {/* Nombre y apellido */}
            <div className="font-semibold text-gray-900 dark:text-gray-100">{`${session?.user.name} ${session?.user.lastName}`}</div>
            {/* Rol */}
            <div className="text-xs text-gray-500 dark:text-gray-400">{session?.user.role}</div>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
