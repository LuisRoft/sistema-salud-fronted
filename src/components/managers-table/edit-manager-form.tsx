import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateManager } from '@/services/managerService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { fetchCareers } from '@/services/careerService';
import { getTeams } from '@/services/teamsService';

// Esquema de validación
export const schema = z.object({
  id: z.string(),
  document: z.string().min(10, 'Documento debe tener al menos 10 caracteres'),
  email: z.string().email('Correo no válido'),
  name: z.string().min(1, 'Nombre es obligatorio'),
  lastName: z.string().min(1, 'Apellido es obligatorio'),
  address: z.string().optional(),
  career: z.string().min(1, { message: 'Debe seleccionar una carrera.' }),
  team: z.string().min(1, { message: 'Debe seleccionar un equipo.' }),
  password: z.string().optional(),
});

export function EditManagerForm({ manager, onClose }: { manager: z.infer<typeof schema>; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener carreras
  const { data: careers, isLoading: loadingCareers, error: errorCareers } = useQuery({
    queryKey: ['careers'],
    queryFn: fetchCareers,
    staleTime: 1000 * 60 * 5,
  });

  // Obtener equipos
  const { data: teams, isLoading: loadingTeams, error: errorTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no disponible.');
      return await getTeams(token, { limit: 100, page: 1 });
    },
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...manager,
      career: manager.career?.id || '',
      team: manager.team?.id || '',
    },
    mode: 'onChange',
  });

  const { mutate, status } = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no disponible.');

      const { id, ...rest } = values;
      return await updateManager(id, { ...rest, career: rest.career, team: rest.team }, token);
    },
    onSuccess: () => {
      toast({
        title: 'Actualización Exitosa',
        description: 'Gestor actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      onClose();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Oh no! Algo está mal',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const isPending = status === 'pending';

  const onSubmit = (values: z.infer<typeof schema>) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col">
        <div className="grid w-full grid-cols-2 gap-x-10 gap-y-6">
          {/* Documento */}
          <FormField control={form.control} name="document" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#575756]">Número de Identificación</FormLabel>
              <FormControl>
                <Input placeholder="1312172818" {...field} className="h-10 text-[#575756]" disabled />
              </FormControl>
              <FormDescription>Este es su número de identificación.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          {/* Nombre */}
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#575756]">Nombre</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} className="h-10 text-[#575756]" />
              </FormControl>
              <FormDescription>Este es su nombre.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          {/* Apellido */}
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#575756]">Apellido</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} className="h-10 text-[#575756]" />
              </FormControl>
              <FormDescription>Este es su apellido.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          {/* Correo */}
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#575756]">Correo Electrónico</FormLabel>
              <FormControl>
                <Input {...field} placeholder="test@pucesm.edu.ec" className="h-10 text-[#575756]" />
              </FormControl>
              <FormDescription>Este es su correo electrónico.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          {/* Dirección */}
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#575756]">Dirección</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} className="h-10 text-[#575756]" />
              </FormControl>
              <FormDescription>Este es su dirección.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          {/* Carrera */}
          <FormField control={form.control} name="career" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#575756]">Carrera</FormLabel>
              <FormControl>
                <select {...field} className="w-full p-2 border rounded-md h-10 text-[#575756] bg-white dark:bg-gray-900 dark:text-white">
                  <option value="">Seleccionar una carrera</option>
                  {loadingCareers ? <option disabled>Cargando...</option> : errorCareers ? <option disabled>Error al cargar carreras</option> : careers?.map((career) => (
                    <option key={career.id} value={career.id}>{career.careerName}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Equipo */}
          <FormField control={form.control} name="team" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#575756]">Equipo</FormLabel>
              <FormControl>
                <select {...field} className="w-full p-2 border rounded-md h-10 text-[#575756] bg-white dark:bg-gray-900 dark:text-white">
                  <option value="">Seleccionar un equipo</option>
                  {loadingTeams ? <option disabled>Cargando...</option> : errorTeams ? <option disabled>Error al cargar equipos</option> : teams?.teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.teamName}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" className="mt-4 font-bold" disabled={isPending}>
          {isPending ? 'Guardando Cambios...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  );
}

