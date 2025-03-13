'use client';
import { Plus, Trash, Edit } from "lucide-react";
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { createTeam } from '@/services/teamsService';
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
import { useEffect, useState } from 'react';
import CreateGroupDialog from '../group/create-group-dialog';
import { getPatients } from '@/services/patientService';
import EditGroupDialog from "../group/EditGroupDialog";
import DeleteGroupDialog from "../group/DeleteGroupDialog";

const formSchema = z.object({
  teamName: z.string().min(10, {
    message: 'Nombre del equipo es requerido.',
  }),
  groupId: z.string().min(1, {
    message: 'Grupo es requerido.',
  }),
  patientIds: z.array(z.string()).min(1, {
    message: 'Debes seleccionar al menos un paciente.',
  }),
});


export default function CreateTeamForm({ onClose }: { onClose: () => void }) {
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [dataGroupItem, setDataGroupItem] = useState<any>(null);
  const [selectedPatients, setSelectedPatients] = useState<{ id: string; name: string; lastName: string }[]>([]);
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
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      await createTeam({ ...values }, token as string);
    },
    onSuccess: () => {
      toast({
        title: 'Creación Exitosa',
        description: 'Usuario creado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
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

  function onSubmit(values: z.infer<typeof formSchema>) { 
    if (values.groupId === 'no-grupos' || !values.patientIds.length) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un grupo y al menos un paciente.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate({
      ...values,
      patientIds: values.patientIds, // Ahora es un array
    });
  }
  

  const handleEditGroup = () => {
    if (!dataGroupItem) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un grupo primero.',
        variant: 'destructive',
      });
      return;
    }
    setEditGroupOpen(true);
  };

  const handleDeleteGroup = () => {
    if (!dataGroupItem) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un grupo primero.',
        variant: 'destructive',
      });
      return;
    }
    setDeleteGroupOpen(true);
  }

  return (
    <>
      <Form {...form}>
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
                          const group = dataGroups?.groups.find((g) => g.id === id); // Encuentra el objeto completo
                          setDataGroupItem(group); // Almacena el objeto en el estado
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
                    <div className='flex gap-3'>
                      <Button 
                        type='button'
                        variant='default'
                        onClick={() => setCreateGroupOpen(true)} >
                        <Plus  />
                      </Button >
                      <Button 
                        type='button' 
                        variant='secondary'
                        onClick={() => handleEditGroup()} >
                        <Edit  />
                      </Button>
                      <Button 
                        type='button' 
                        variant='destructive'
                        onClick={() => handleDeleteGroup()}>
                        <Trash  />
                      </Button>
                    </div>
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
        name='patientIds'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-[#575756]'>Pacientes Asignados</FormLabel>
            <FormControl>
              <Select
                onValueChange={(selectedId) => {
                  const patient = dataPatients?.patients.find((p) => p.id === selectedId);

                  if (patient && !selectedPatients.some((p) => p.id === patient.id)) {
                    setSelectedPatients([...selectedPatients, patient]);  // Agregar paciente a la lista
                    field.onChange([...(field.value ?? []), selectedId]);  // ✅ Aseguramos que siempre sea un array
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona pacientes' />
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
              <div className='mt-3 border p-3 rounded-md'>
                <h3 className='text-sm font-semibold mb-2'>Pacientes Seleccionados:</h3>
                <ul className='space-y-2'>
                  {selectedPatients.map((patient) => (
                    <li key={patient.id} className='flex justify-between items-center border-b pb-2'>
                      <span>
                        {patient.name} {patient.lastName}
                      </span>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => {
                          setSelectedPatients(selectedPatients.filter((p) => p.id !== patient.id)); // Remover de la lista
                          field.onChange((field.value ?? []).filter((id) => id !== patient.id)); // ✅ Siempre array
                        }}
                      >
                        <Trash size={14} />
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
                <span>Creando Team</span>
                <Loader2 className='animate-spin' size={16} strokeWidth={2} />
              </div>
            ) : (
              'Crear Equipo'
            )}
          </Button>
        </form>
      </Form>

      {/* Diálogo para crear un grupo */}
      <CreateGroupDialog
        isOpen={createGroupOpen}
        setIsOpen={setCreateGroupOpen}   
      />

      { editGroupOpen ?
        <EditGroupDialog
        isOpen={editGroupOpen}
        setIsOpen={setEditGroupOpen}   
        dataGroup={dataGroupItem}
        setDataGroup={setDataGroupItem}/> : null 
        }

      { deleteGroupOpen ? 
          <DeleteGroupDialog
          isOpen={deleteGroupOpen}
          setIsOpen={setDeleteGroupOpen}
          groupId={dataGroupItem?.id}
          onDeleteSuccess={() => {
            setDataGroupItem(null);  // Limpia el estado
            form.setValue('groupId', '');  // Limpia el valor del select
          }}
          />: null}
    </>
  );
}
