'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { updateTeam } from '@/services/teamsService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getGroups } from '@/services/groupsService';
import { getPatients } from '@/services/patientService';
import { getManagers } from '@/services/managerService';
import { Team } from '@/types/team/team';

const editFormSchema = z.object({
  teamName: z.string().min(10, {
    message: 'El nombre del equipo debe tener al menos 10 caracteres.',
  }),
  groupId: z.string().min(1, {
    message: 'Debe seleccionar un grupo.',
  }),
  patientId: z.string().min(1, {
    message: 'Debe seleccionar un paciente.',
  }),
  userIds: z.array(z.string()).min(1, {
    message: 'Debe seleccionar al menos un gestor.',
  }).max(5, {
    message: 'No puede seleccionar más de 5 gestores.',
  }),
});

type EditFormValues = z.infer<typeof editFormSchema>;

interface EditTeamFormProps {
  onClose: () => void;
  team: Team;
}

export function EditTeamForm({ onClose, team }: EditTeamFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries para obtener datos
  const { data: dataGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return getGroups(token as string);
    },
  });

  const { data: dataPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return getPatients(token as string, { limit: 20, page: 1 });
    },
  });

  const { data: managers } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return getManagers(token as string, { limit: 100 });
    },
  });

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      teamName: team.teamName,
      groupId: team.group.id,
      patientId: team.patient.id,
      userIds: team.users.map(user => user.id),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: EditFormValues) => {
      const session = await getSession();
      const token = session?.user.access_token;
      await updateTeam(values, token as string, team.id);
    },
    onSuccess: () => {
      toast({
        title: 'Actualización Exitosa',
        description: 'Equipo actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      onClose();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el equipo',
        variant: 'destructive',
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Equipo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grupo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  {dataGroups?.groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {dataPatients?.patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gestores</FormLabel>
              <FormControl>
                <select
                  multiple
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                    if (selectedOptions.length <= 5) {
                      field.onChange(selectedOptions);
                    }
                  }}
                  value={field.value}
                >
                  {managers?.users.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} {manager.lastName}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Seleccione hasta 5 gestores (Mantenga presionado Ctrl/Cmd para seleccionar múltiples)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Actualizando...</span>
            </div>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </form>
    </Form>
  );
} 