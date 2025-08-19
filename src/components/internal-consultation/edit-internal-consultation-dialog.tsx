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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { InternalConsultationManagementRow } from './internal-consultation-management-columns';

const formSchema = z.object({
  numeroArchivo: z.string().min(1, 'El número de archivo es requerido'),
  cedula: z.string().optional(),
  nombrePaciente: z.string().min(1, 'El nombre del paciente es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  motivoInterconsulta: z.string().min(1, 'El motivo de interconsulta es requerido'),
  especialidadSolicitada: z.string().min(1, 'La especialidad es requerida'),
  diagnosticoPresuntivo: z.string().min(1, 'El diagnóstico presuntivo es requerido'),
  hallazgosRelevantes: z.string().min(1, 'Los hallazgos son requeridos'),
  prioridadInterconsulta: z.string().min(1, 'La prioridad es requerida'),
  servicioSolicitante: z.string().min(1, 'El servicio solicitante es requerido'),
});

type FormData = z.infer<typeof formSchema>;

interface EditInternalConsultationDialogProps {
  data: InternalConsultationManagementRow;
  isOpen: boolean;
  onClose: () => void;
}

const EditInternalConsultationDialog: React.FC<EditInternalConsultationDialogProps> = ({
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
      motivoInterconsulta: data.motivoInterconsulta || '',
      especialidadSolicitada: data.especialidadSolicitada || '',
      diagnosticoPresuntivo: data.diagnosticoPresuntivo || '',
      hallazgosRelevantes: data.hallazgosRelevantes || '',
      prioridadInterconsulta: data.prioridadInterconsulta || '',
      servicioSolicitante: data.servicioSolicitante || '',
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      // Actualizar datos localmente
      const updatedData: InternalConsultationManagementRow = {
        ...data,
        numeroArchivo: values.numeroArchivo,
        cedula: values.cedula,
        nombrePaciente: values.nombrePaciente,
        fecha: values.fecha,
        motivoInterconsulta: values.motivoInterconsulta,
        especialidadSolicitada: values.especialidadSolicitada,
        diagnosticoPresuntivo: values.diagnosticoPresuntivo,
        hallazgosRelevantes: values.hallazgosRelevantes,
        prioridadInterconsulta: values.prioridadInterconsulta,
        servicioSolicitante: values.servicioSolicitante,
      };

      // Actualizar en el cache de react-query
      queryClient.setQueryData(['internal-consultation-management'], (oldData: InternalConsultationManagementRow[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(item => 
          item.id === data.id ? updatedData : item
        );
      });

      // Invalidar queries para refrescar la tabla
      queryClient.invalidateQueries({ queryKey: ['internal-consultation-management'] });

      onClose();
      form.reset();
    } catch (error) {
      console.error('Error al actualizar la interconsulta:', error);
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Editar Interconsulta
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
                    <FormLabel>Fecha de Solicitud</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="especialidadSolicitada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidad Solicitada</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una especialidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cardiologia">Cardiología</SelectItem>
                        <SelectItem value="neurologia">Neurología</SelectItem>
                        <SelectItem value="gastroenterologia">Gastroenterología</SelectItem>
                        <SelectItem value="dermatologia">Dermatología</SelectItem>
                        <SelectItem value="traumatologia">Traumatología</SelectItem>
                        <SelectItem value="endocrinologia">Endocrinología</SelectItem>
                        <SelectItem value="psiquiatria">Psiquiatría</SelectItem>
                        <SelectItem value="urologia">Urología</SelectItem>
                        <SelectItem value="oftalmologia">Oftalmología</SelectItem>
                        <SelectItem value="otorrinolaringologia">Otorrinolaringología</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prioridadInterconsulta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Urgente">Urgente</SelectItem>
                        <SelectItem value="Programada">Programada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="servicioSolicitante"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Servicio Solicitante</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el servicio que solicita" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="motivoInterconsulta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de Interconsulta</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa el motivo de la interconsulta"
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
              name="diagnosticoPresuntivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico Presuntivo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa el diagnóstico presuntivo"
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
              name="hallazgosRelevantes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hallazgos Relevantes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa los hallazgos relevantes"
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

export default EditInternalConsultationDialog;
