import { Bot, HeartHandshake, User2, Users } from 'lucide-react';

export const sidebarItems = {
  navMain: [
    {
      title: 'Gestores y Admins',
      icon: User2,
      isActive: true,
      items: [
        {
          title: 'Manejar Gestores',
          url: '/dashboard/managers',
        },
        {
          title: 'Manejar Administradores',
          url: '/dashboard/admins',
        },
      ],
    },
    {
      title: 'Usuarios',
      icon: Bot,
      items: [
        {
          title: 'Manejar Usuarios',
          url: '/dashboard/users',
        },
      ],
    },
    {
      title: 'Cuidadores',
      icon: HeartHandshake,
      items: [
        {
          title: 'Manejar Cuidador',
          url: '/dashboard/caregivers',
        },
      ],
    },
    {
      title: 'Equipos',
      icon: Users,
      items: [
        {
          title: 'Manejar Equipos',
          url: '/dashboard/teams',
        },
      ],
    },
  ],
};
