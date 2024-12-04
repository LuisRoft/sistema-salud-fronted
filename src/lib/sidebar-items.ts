import { Bot, HeartHandshake, User2, Users } from 'lucide-react';

export const sidebarItems = {
  navMain: [
    {
      title: 'Usuarios',
      icon: User2,
      isActive: true,
      items: [
        {
          title: 'Manejar Usuarios',
          url: '/dashboard/users',
        },
      ],
    },
    {
      title: 'Gestores',
      icon: Bot,
      items: [
        {
          title: 'Manejar Gestores',
          url: '/dashboard/managers',
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
          title: 'Manejar Grupos de Trabajo',
          url: '/dashboard/groups',
        },
        {
          title: 'Manejar Equipos',
          url: '/dashboard/teams',
        },
      ],
    },
  ],
};
