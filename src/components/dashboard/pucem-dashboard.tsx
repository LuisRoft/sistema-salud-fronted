'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Stethoscope,
  Building2,
  UserCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getAllConsultations } from '@/services/consultationHistory.service';
import { getPatients } from '@/services/patientService';
import { getManagers } from '@/services/managerService';
import { getCaregivers } from '@/services/caregiverService';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

const chartConfig = {
  externas: {
    label: "Consultas Externas",
    color: "hsl(var(--chart-1))",
  },
  internas: {
    label: "Consultas Internas", 
    color: "hsl(var(--chart-2))",
  },
  enfermeria: {
    label: "Consultas Enfermería",
    color: "hsl(var(--chart-3))",
  },
  laboratorio: {
    label: "Solicitudes Laboratorio",
    color: "hsl(var(--chart-4))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--chart-5))",
  }
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export default function PucemDashboard() {
  const { data: session } = useSession();
  const token = session?.user?.access_token;

  // Consultas principales
  const { data: consultationsData, isLoading: consultationsLoading } = useQuery({
    queryKey: ['dashboard-consultations'],
    queryFn: async () => {
      if (!token) return null;
      return await getAllConsultations(token);
    },
    enabled: !!token,
    staleTime: 60000,
  });

  // Pacientes
  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['dashboard-patients'],
    queryFn: async () => {
      if (!token) return null;
      return await getPatients(token, { page: 1, limit: 1000 });
    },
    enabled: !!token,
    staleTime: 60000,
  });

  // Gestores
  const { data: managersData, isLoading: managersLoading } = useQuery({
    queryKey: ['dashboard-managers'],
    queryFn: async () => {
      if (!token) return null;
      return await getManagers(token, { page: 1, limit: 1000 });
    },
    enabled: !!token,
    staleTime: 60000,
  });

  // Cuidadores
  const { data: caregiversData, isLoading: caregiversLoading } = useQuery({
    queryKey: ['dashboard-caregivers'],
    queryFn: async () => {
      if (!token) return null;
      return await getCaregivers(token, 1000, 1);
    },
    enabled: !!token,
    staleTime: 60000,
  });

  const isLoading = consultationsLoading || patientsLoading || managersLoading || caregiversLoading;

  // Procesar datos para gráficos
  const processChartData = () => {
    if (!consultationsData?.consultations) return { weeklyData: [], pieData: [], trendsData: [] };

    const consultations = consultationsData.consultations;
    
    // Datos semanales
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyData = weekDays.map((day: Date) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayConsultations = consultations.filter(c => 
        format(new Date(c.fecha), 'yyyy-MM-dd') === dayStr
      );

      return {
        day: format(day, 'EEE', { locale: es }),
        date: dayStr,
        externas: dayConsultations.filter(c => c.type === 'Consulta Externa').length,
        internas: dayConsultations.filter(c => c.type === 'Consulta Interna').length,
        enfermeria: dayConsultations.filter(c => c.type === 'Consulta Enfermería').length,
        laboratorio: dayConsultations.filter(c => c.type === 'Solicitud Laboratorio').length,
        total: dayConsultations.length
      };
    });

    // Datos para gráfico circular
    const pieData = [
      { name: 'Externas', value: consultationsData.stats?.externas || 0, color: COLORS[0] },
      { name: 'Internas', value: consultationsData.stats?.internas || 0, color: COLORS[1] },
      { name: 'Enfermería', value: consultationsData.stats?.enfermeria || 0, color: COLORS[2] },
      { name: 'Laboratorio', value: consultationsData.stats?.laboratorio || 0, color: COLORS[3] }
    ].filter(item => item.value > 0);

    // Tendencias últimos 7 días
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayConsultations = consultations.filter(c => 
        format(new Date(c.fecha), 'yyyy-MM-dd') === dateStr
      );

      return {
        date: format(date, 'dd/MM'),
        total: dayConsultations.length,
        externas: dayConsultations.filter(c => c.type === 'Consulta Externa').length,
        internas: dayConsultations.filter(c => c.type === 'Consulta Interna').length
      };
    });

    return { weeklyData, pieData, trendsData: last7Days };
  };

  const { weeklyData, pieData, trendsData } = processChartData();

  // Calcular métricas
  const metrics = {
    totalConsultations: consultationsData?.stats?.total || 0,
    totalPatients: patientsData?.total || 0,
    totalManagers: managersData?.total || 0,
    totalCaregivers: caregiversData?.total || 0,
    urgentConsultations: consultationsData?.consultations?.filter(c => c.esUrgente).length || 0,
    todayConsultations: consultationsData?.consultations?.filter(c => 
      format(new Date(c.fecha), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length || 0
  };

  // Calcular tendencias
  const yesterdayConsultations = consultationsData?.consultations?.filter(c => 
    format(new Date(c.fecha), 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd')
  ).length || 0;

  const consultationTrend = metrics.todayConsultations - yesterdayConsultations;
  const consultationTrendPercentage = yesterdayConsultations > 0 
    ? ((consultationTrend / yesterdayConsultations) * 100).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard PUCEM</h1>
          <p className="text-muted-foreground">
            Sistema de Salud para Personas con Discapacidad
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Activity className="w-4 h-4 mr-1" />
            Sistema Activo
          </Badge>
          <Badge variant="outline">
            {format(new Date(), 'dd MMMM yyyy', { locale: es })}
          </Badge>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConsultations}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {consultationTrend >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={consultationTrend >= 0 ? "text-green-600" : "text-red-600"}>
                {consultationTrendPercentage}% vs ayer
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Personas con discapacidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayConsultations}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.urgentConsultations} urgentes este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalManagers + metrics.totalCaregivers}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalManagers} gestores, {metrics.totalCaregivers} cuidadores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de barras - Consultas semanales */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Consultas Esta Semana</CardTitle>
            <CardDescription>
              Distribución de consultas por día y tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="externas" stackId="a" fill="var(--color-externas)" />
                  <Bar dataKey="internas" stackId="a" fill="var(--color-internas)" />
                  <Bar dataKey="enfermeria" stackId="a" fill="var(--color-enfermeria)" />
                  <Bar dataKey="laboratorio" stackId="a" fill="var(--color-laboratorio)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico circular - Distribución de consultas */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tipos de Consulta</CardTitle>
            <CardDescription>
              Distribución por tipo de servicio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
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

      {/* Tendencias y alertas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tendencia últimos 7 días */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Tendencia Últimos 7 Días
            </CardTitle>
            <CardDescription>
              Evolución diaria de consultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--color-total)" 
                    strokeWidth={3}
                    dot={{ fill: "var(--color-total)" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="externas" 
                    stroke="var(--color-externas)" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="internas" 
                    stroke="var(--color-internas)" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Alertas y acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Resumen de alertas y acciones recomendadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.urgentConsultations > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    {metrics.urgentConsultations} consultas urgentes pendientes
                  </span>
                </div>
                <Button size="sm" variant="destructive">
                  Revisar
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {metrics.todayConsultations} consultas realizadas hoy
                </span>
              </div>
              <Badge variant="secondary">{metrics.todayConsultations > 10 ? 'Alto' : 'Normal'}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Sistema operativo al 100%
                </span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Estable
              </Badge>
            </div>

            <div className="pt-2">
              <Button className="w-full" variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Ver Historial Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
