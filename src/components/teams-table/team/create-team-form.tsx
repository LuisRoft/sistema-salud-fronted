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
import { getManagers } from '@/services/managerService';

const formSchema = z.object({
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

export default function CreateTeamForm({ onClose }: { onClose: () => void }) {
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [dataGroupItem, setDataGroupItem] = useState<any>(null);
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

  // Agregar query para obtener gestores
  const { data: managers } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const session = await getSession();
      const token = session?.user.access_token;
      return getManagers(token as string, { limit: 100 });
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
              name='patientId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#575756]'>
                    Paciente Asignado
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
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

            {/* Nuevo campo para seleccionar gestores */}
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
              'Crear Team'
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
