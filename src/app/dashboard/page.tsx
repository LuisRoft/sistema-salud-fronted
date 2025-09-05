/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { LoaderIcon, Users, Shield, UserCheck, Building2, Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getManagers } from '@/services/managerService';
import { getAdmins } from '@/services/adminService';
import { getPatients } from '@/services/patientService';
import { getTeams } from '@/services/teamsService';
import { getCaregivers } from '@/services/caregiverService';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export default function Page() {
  const { data: session, status } = useSession();
  const token = session?.user?.access_token;

  // Consultas usando React Query y servicios existentes
  const { data: managersData, isLoading: managersLoading } = useQuery({
    queryKey: ['dashboard-managers'],
    queryFn: async () => {
      if (!token) return null;
      return await getManagers(token, { page: 1, limit: 1000 });
    },
    enabled: !!token,
    staleTime: 60000,
  });

  const { data: adminsData, isLoading: adminsLoading } = useQuery({
    queryKey: ['dashboard-admins'],
    queryFn: async () => {
      if (!token) return null;
      return await getAdmins(token, { page: 1, limit: 1000 });
    },
    enabled: !!token,
    staleTime: 60000,
  });

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['dashboard-patients'],
    queryFn: async () => {
      if (!token) return null;
      return await getPatients(token, { page: 1, limit: 1000 });
    },
    enabled: !!token,
    staleTime: 60000,
  });

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['dashboard-teams'],
    queryFn: async () => {
      if (!token) return null;
      return await getTeams(token, { page: 1, limit: 1000 });
    },
    enabled: !!token,
    staleTime: 60000,
  });

  const { data: caregiversData, isLoading: caregiversLoading } = useQuery({
    queryKey: ['dashboard-caregivers'],
    queryFn: async () => {
      if (!token) return null;
      return await getCaregivers(token, 1000, 1);
    },
    enabled: !!token,
    staleTime: 60000,
  });

  const isLoading = status === 'loading' || managersLoading || adminsLoading || patientsLoading || teamsLoading || caregiversLoading;


  // Preparar datos para gráficos
  const statsData = [
    { 
      name: 'Gestores', 
      value: managersData?.users?.length || 0, 
      color: COLORS[0],
      icon: UserCheck 
    },
    { 
      name: 'Administradores', 
      value: adminsData?.admins?.length || 0, 
      color: COLORS[1],
      icon: Shield 
    },
    { 
      name: 'Pacientes', 
      value: patientsData?.patients?.length || 0, 
      color: COLORS[2],
      icon: Heart 
    },
    { 
      name: 'Equipos', 
      value: teamsData?.teams?.length || 0, 
      color: COLORS[3],
      icon: Building2 
    },
    { 
      name: 'Cuidadores', 
      value: caregiversData?.caregivers?.length || 0, 
      color: COLORS[4],
      icon: Users 
    }
  ];

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className="text-center">
          <LoaderIcon className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
          <p className="text-muted-foreground">Cargando dashboard administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema de salud PUCEM
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsData.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  Total registrados
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de barras */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Cantidad",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="value" fill="var(--color-value)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico circular */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución Porcentual</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Cantidad",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}