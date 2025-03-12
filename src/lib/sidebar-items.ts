import {
  Bot,
  BriefcaseMedicalIcon,
  HeartHandshake,
  SyringeIcon,
  User2,
  Users,
} from 'lucide-react';

export const sidebarItems = {
  admin: [
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
  user: [
    {
      title: 'Usuarios',
      icon: Users,
      isActive: true,
      items: [
        {
          title: 'Usuarios asignados',
          url: '/pucem/users',
        },
      ],
    },
    {
      title: 'Medicina',
      icon: BriefcaseMedicalIcon,
      isActive: true,
      items: [
        {
          title: 'Consulta Externa',
          url: '/pucem/consultation-external',
        },
        {
          title: 'Interconsulta',
          url: '/pucem/consultation-internal',
        },
        {
          title: 'Pedido de Laboratorio',
          url: '/pucem/lab-request',
        },
      ],
    },
    {
      title: 'Enfermería',
      icon: SyringeIcon,
      isActive: true,
      items: [
        {
          title: 'Formulario de Enfermería',
          url: '/pucem/nursing',
        },
      ],
    },
  ],
};
