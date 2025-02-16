'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { any, z } from 'zod';

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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { updateTeam } from '@/services/teamsService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { getGroups } from '@/services/groupsService';
import { useState } from 'react';
import { getPatients } from '@/services/patientService';
import { Team } from '@/components/teams-table/columns';

const formSchema = z.object({
  teamName: z.string().min(10, {
    message: 'Nombre del equipo es requerido.',
  }),
  groupId: z.string().min(1, {
    message: 'Grupo es requerido.',
  }),
  patientId: z.string().min(1, {
    message: 'Paciente asignado es requerido.',
  }),
});

interface EditTeamDialogProps {
  data: Team;
  onClose: () => void;
}
export default function EditTeamDialog({ data, onClose }: EditTeamDialogProps ) {
 
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener datos de grupos
  const { data: dataGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await getGroups(token as string);
    }, 
  });

  // Obtener datos de pacientes
  const { data: dataPatients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await getPatients(token as string, { limit: 20, page: 1 });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { teamName: data.teamName , groupId: data.group.id, patientId: data.patient.id },
  });
  
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await updateTeam(values as any, token as string, data.id);
    },
    onSuccess: () => {
      toast({
        title: 'Edición Exitosa',
        description: 'Grupo editado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al editar equipo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) { 
    if (values.groupId === 'no-grupos' || values.patientId === 'no-pacientes') {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un grupo y un paciente válido.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate(values);
  }

  return (
    <>
      <Form {...form} >
        <form
        
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex w-full flex-col'
        >
          <div className='grid w-full gap-y-4'>
            {/* Campo Nombre del Equipo */}
            <FormField
              control={form.control}
              name='teamName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#575756]'>
                    Nombre del Equipo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Equipo de prueba'
                      {...field}
                      className='h-10 text-[#575756]'
                      value={field.value }
                    />
                  </FormControl>
                  <FormDescription>
                    Este es el nombre del equipo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Grupo */}
            <FormField
              control={form.control}
              name='groupId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#575756]'>Grupo</FormLabel>
                  <div className='flex items-center gap-4'>
                    <FormControl>
                      <Select
                        onValueChange={(id) => {
                          field.onChange(id); // Pasa solo el ID al formulario (si es necesario)
                        }}

                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              groupsLoading
                                ? 'Cargando grupos...'
                                : 'Selecciona un grupo'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {dataGroups ? (
                            dataGroups.groups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.groupName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value='no-grupos'>
                              No hay grupos disponibles
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    
                  </div>
                  <FormDescription>
                    Selecciona o crea un grupo para el equipo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Paciente */}
            <FormField
              control={form.control}
              name='patientId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#575756]'>
                    Paciente Asignado
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(id) => {
                        field.onChange(id); // Pasa solo el ID al formulario (si es necesario)
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            patientsLoading
                              ? 'Cargando pacientes...'
                              : 'Selecciona un paciente'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {dataPatients ? (
                          dataPatients.patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} {patient.lastName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value='no-pacientes'>
                            No hay pacientes disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Selecciona el paciente asignado al equipo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Botón de enviar */}
          <Button
            type='submit'
            className='mt-4 justify-center font-bold'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <div className='flex items-center justify-center gap-2'>
                <span>Editando Team</span>
                <Loader2 className='animate-spin' size={16} strokeWidth={2} />
              </div>
            ) : (
              'Editar Team'
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}