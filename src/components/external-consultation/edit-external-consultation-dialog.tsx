'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { ExternalConsultationManagementRow } from './external-consultation-management-columns';

const formSchema = z.object({
  numeroArchivo: z.string().min(1, 'El número de archivo es requerido'),
  cedula: z.string().optional(),
  nombrePaciente: z.string().min(1, 'El nombre del paciente es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  motivoConsulta: z.string().min(1, 'El motivo de consulta es requerido'),
  diagnostico: z.string().min(1, 'El diagnóstico es requerido'),
  planTratamiento: z.string().min(1, 'El plan de tratamiento es requerido'),
  establecimientoSalud: z.string().min(1, 'El establecimiento de salud es requerido'),
});

type FormData = z.infer<typeof formSchema>;

interface EditExternalConsultationDialogProps {
  data: ExternalConsultationManagementRow;
  isOpen: boolean;
  onClose: () => void;
}

const EditExternalConsultationDialog: React.FC<EditExternalConsultationDialogProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroArchivo: data.numeroArchivo || '',
      cedula: data.patient?.document || data.cedula || '',
      nombrePaciente: data.patient ? `${data.patient.name} ${data.patient.lastName}` : data.nombrePaciente || '',
      fecha: data.fecha || '',
      motivoConsulta: data.motivoConsulta || '',
      diagnostico: data.diagnostico || '',
      planTratamiento: data.planTratamiento || '',
      establecimientoSalud: data.establecimientoSalud || '',
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      // Actualizar datos localmente
      const updatedData: ExternalConsultationManagementRow = {
        ...data,
        numeroArchivo: values.numeroArchivo,
        cedula: values.cedula,
        nombrePaciente: values.nombrePaciente,
        fecha: values.fecha,
        motivoConsulta: values.motivoConsulta,
        diagnostico: values.diagnostico,
        planTratamiento: values.planTratamiento,
        establecimientoSalud: values.establecimientoSalud,
      };

      // Actualizar en el cache de react-query
      queryClient.setQueryData(['external-consultation-management'], (oldData: ExternalConsultationManagementRow[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(item => 
          item.id === data.id ? updatedData : item
        );
      });

      // Invalidar queries para refrescar la tabla
      queryClient.invalidateQueries({ queryKey: ['external-consultation-management'] });

      onClose();
      form.reset();
    } catch (error) {
      console.error('Error al actualizar la consulta externa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Editar Consulta Externa
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numeroArchivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Archivo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el número de archivo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cedula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cédula</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese la cédula" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombrePaciente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Paciente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el nombre del paciente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Consulta</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="establecimientoSalud"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Establecimiento de Salud</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el establecimiento de salud" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="motivoConsulta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de Consulta</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa el motivo de la consulta"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnostico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa el diagnóstico"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="planTratamiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan de Tratamiento</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa el plan de tratamiento"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExternalConsultationDialog;
