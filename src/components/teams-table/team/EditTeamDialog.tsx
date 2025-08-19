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
  groupId: z.string().min(1, {
    message: 'Grupo es requerido.',
  }),
  patientIds: z.array(z.string()).min(1, {
    message: 'Debes seleccionar al menos un paciente.',
  }),
});


interface EditTeamDialogProps {
  data: Team;
  onClose: () => void;
}
export default function EditTeamDialog({ data, onClose }: EditTeamDialogProps) {

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

  // Asegurar que `data.patient` es un array (si no lo es, lo convertimos en uno)
  const patientsArray = Array.isArray(data.patient) ? data.patient : [data.patient];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: data.teamName,
      groupId: data.group.id,
      patientIds: patientsArray.map((p) => p.id),  // ✅ Ahora es un array seguro
    },
  });

  // Estado para pacientes seleccionados
  const [selectedPatients, setSelectedPatients] = useState<{ id: string; name: string; lastName: string }[]>(
    patientsArray.map((p) => ({ id: p.id, name: p.name, lastName: p.lastName })) // ✅ Ahora seguro
  );




  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      
      // Create a properly formatted object for the API
      const updateData = {
        teamName: values.teamName,
        groupId: values.groupId,
        patientIds: values.patientIds, // This should be an array of patient IDs
      };
      
      console.log('Sending team update data:', updateData);
      
      try {
        const result = await updateTeam(updateData, token as string, data.id);
        console.log('Update result:', result);
        return result;
      } catch (error) {
        console.error('Error in mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Edición Exitosa',
        description: 'Equipo editado exitosamente.',
      });
      // Force a refetch of the teams data
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      // Also invalidate any related queries
      queryClient.invalidateQueries({ queryKey: ['patients'] });
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
    if (values.groupId === 'no-grupos') {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un grupo y un paciente válido.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Submitting form with values:', values);
    
    // Ensure patientIds is an array
    if (!Array.isArray(values.patientIds) || values.patientIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar al menos un paciente.',
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
                      value={field.value}
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
              name="patientIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#575756]">Pacientes Asignados</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(selectedId) => {
                        const patient = dataPatients?.patients.find((p) => p.id === selectedId);
                        if (patient && !selectedPatients.some((p) => p.id === patient.id)) {
                          setSelectedPatients([...selectedPatients, patient]);  // Agrega a la lista
                          field.onChange([...field.value, selectedId]);  // Agrega al formulario
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona pacientes" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataPatients?.patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  {/* Lista de Pacientes Seleccionados */}
                  {selectedPatients.length > 0 && (
                    <div className="mt-3 border p-3 rounded-md">
                      <h3 className="text-sm font-semibold mb-2">Pacientes Seleccionados:</h3>
                      <ul className="space-y-2">
                        {selectedPatients.map((patient) => (
                          <li key={patient.id} className="flex justify-between items-center border-b pb-2">
                            <span>
                              {patient.name} {patient.lastName}
                            </span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedPatients(selectedPatients.filter((p) => p.id !== patient.id)); // Remueve de la lista
                                field.onChange(field.value.filter((id) => id !== patient.id)); // Remueve del formulario
                              }}
                            >
                              ❌
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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