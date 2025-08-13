'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react'; // Importar useSession
import { NavMain } from '@/components/sidebar/nav-main';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { University } from 'lucide-react';
import { sidebarItems } from '@/lib/sidebar-items';
import { ModeToggle } from '../ui/mode-toggle';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Obtener la sesión del usuario
  const { data: session } = useSession();

  // Función para obtener los sidebarItems según el rol
  const getSidebarItems = () => {
    if (session?.user.role === 'admin') {
      return sidebarItems.admin;
    } else if (session?.user.role === 'user') {
      return sidebarItems.user;
    }
    return [];
  };

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu className='flex flex-row items-center justify-between'>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/dashboard' className='px-3 pr-10'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground'>
                  <University className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>PUCEM</span>
                  <span className='truncate text-xs'>Software</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <div>
            <ModeToggle />
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Pasar los sidebarItems correspondientes a NavMain */}
        <NavMain items={getSidebarItems()} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
