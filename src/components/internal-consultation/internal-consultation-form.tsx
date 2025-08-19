'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  FileText, 
  Heart, 
  Activity, 
  Stethoscope, 
  ClipboardList, 
  Plus, 
  Trash2,
  Save,
  RotateCcw,
  AlertCircle,
  Calendar,
  UserCheck,
  Microscope,
  Hospital,
  FileCheck,
  Target,
  Zap
} from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { createInternalConsultation } from '@/services/internalConsultation.service';
import { useState } from 'react';
import { PatientSelector } from '@/components/shared/patient-selector';
import AutocompleteCIE from '@/components/cie-10/autocompleteCIE';
import AutocompleteCIF from '@/components/cif/autocompleteCIF';
import { Patient } from '@/services/patientService';

const formSchema = z.object({
  numeroDeArchivo: z.number().min(1, 'Campo obligatorio'),
  fecha: z.string().min(1, 'Campo obligatorio'),
  motivoConsulta: z.string().min(1, 'Campo obligatorio'),
  servicio: z.string().min(1, 'Campo obligatorio'),
  especialidadConsultada: z.string().min(1, 'Campo obligatorio'),
  esUrgente: z.boolean(),
  cuadroClinicoActual: z.string().min(1, 'Campo obligatorio'),
  examenesResultados: z.array(z.string()).optional(),
  diagnosticoGeneral: z.string().min(1, 'Campo obligatorio'), // Campo agregado
  diagnosticosDesc: z.array(z.string()).optional(),
  diagnosticosCie: z.array(z.string()).optional(),
  diagnosticosCif: z.array(z.string()).optional(), // Nuevo campo CIF
  diagnosticosPresuntivo: z.array(z.boolean()).optional(),
  diagnosticosDefinitivo: z.array(z.boolean()).optional(),
  planTratamiento: z.string().min(1, 'Campo obligatorio'), // Campo agregado
  cuadroClinicoInterconsulta: z.string().optional(), // Campo agregado
  planDiagnosticoPropuesto: z.string().optional(), // Campo agregado
  planTerapeuticoPropuesto: z.string().min(1, 'Campo obligatorio'),
  patientId: z.string().min(1, 'Campo obligatorio'), // Agregado aquí
});

type FormValues = z.infer<typeof formSchema>;

export default function InternalConsultationForm() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroDeArchivo: 0,
      fecha: new Date().toISOString().split('T')[0],
      motivoConsulta: '',
      servicio: 'CONSULTA EXTERNA',
      especialidadConsultada: '',
      esUrgente: false,
      cuadroClinicoActual: '',
      examenesResultados: [],
      diagnosticoGeneral: '', 
      diagnosticosDesc: [],
      diagnosticosCie: [],
      diagnosticosPresuntivo: [],
      diagnosticosDefinitivo: [],
      planTratamiento: '', // Valor predeterminado agregado
      cuadroClinicoInterconsulta: '', // Valor predeterminado agregado
      planDiagnosticoPropuesto: '', // Valor predeterminado agregado
      planTerapeuticoPropuesto: '',
    },
  });
   
  const handlePatientSelect = (patient: Patient) => {
    console.log('Paciente seleccionado:', patient); // Verificar el objeto completo
    setSelectedPatient(patient); // Guardar el paciente en el estado
    setValue('numeroDeArchivo', Number(patient.document));
    setValue('fecha', patient.birthday);
    setValue('cuadroClinicoActual', patient.typeDisability);
    setValue('patientId', patient.id); // Utilizar el objeto `patient` directamente
  };
  
  

  const [diagnosticos, setDiagnosticos] = useState<{ desc: string; cie: string; cif: string; presuntivo: boolean; definitivo: boolean; }[]>([
    { desc: '', cie: '', cif: '', presuntivo: false, definitivo: false },
  ]);
  const [examenes, setExamenes] = useState(['']);

  const agregarDiagnostico = () => {
    setDiagnosticos([
      ...diagnosticos,
      { desc: '', cie: '', cif: '', presuntivo: false, definitivo: false },
    ]);
  };

  const eliminarDiagnostico = (index: number) => {
  const nuevosDiagnosticos = [...diagnosticos];
  nuevosDiagnosticos.splice(index, 1);
  setDiagnosticos(nuevosDiagnosticos);
};

  const agregarExamen = () => {
    setExamenes([...examenes, '']);
  };

  const eliminarExamen = (index: number) => {
    const nuevosExamenes = [...examenes];
    nuevosExamenes.splice(index, 1);
    setExamenes(nuevosExamenes);
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
      const sessionData = await getSession();
      if (!sessionData?.user?.access_token) {
        toast({
          title: 'Error',
          description: 'No hay información del usuario',
          variant: 'destructive',
        });
        return;
      }
  
      if (!selectedPatient) {
        toast({
          title: 'Error',
          description: 'No se ha seleccionado un paciente',
          variant: 'destructive',
        });
        return;
      }
  
      const token = sessionData.user.access_token;
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;
  
      const formattedData = {
        numeroDeArchivo: Number(data.numeroDeArchivo),
        fecha: data.fecha,
        motivoConsulta: data.motivoConsulta.trim(),
        servicio: data.servicio.trim(),
        especialidadConsultada: data.especialidadConsultada.trim(),
        esUrgente: Boolean(data.esUrgente),
        cuadroClinicoActual: data.cuadroClinicoActual.trim(),
        examenesResultados: examenes.filter(Boolean),
        diagnosticosDesc: diagnosticos.map((d) => d.desc).filter(Boolean),
        diagnosticosCie: diagnosticos.map((d) => d.cie).filter(Boolean),
        // diagnosticosCif: diagnosticos.map((d) => d.cif).filter(Boolean), // Removido temporalmente - servidor no acepta esta propiedad
        diagnosticosPresuntivo: diagnosticos.map((d) => d.presuntivo),
        diagnosticosDefinitivo: diagnosticos.map((d) => d.definitivo),
        planTratamiento: data.planTratamiento?.trim() ?? '',
        cuadroClinicoInterconsulta: data.cuadroClinicoInterconsulta?.trim() ?? '',
        planDiagnosticoPropuesto: data.planDiagnosticoPropuesto?.trim() ?? '',
        planTerapeuticoPropuesto: data.planTerapeuticoPropuesto?.trim() ?? '',
        user: userId,
        patient: selectedPatient?.id, // Verificar que el paciente esté seleccionado
      };
  
      console.log('📝 Datos formateados a enviar:', formattedData);
  
      const response = await createInternalConsultation(formattedData, token);
      console.log('✅ Respuesta del servidor:', response);

      // Limpiar formulario después del éxito
      reset();
      setSelectedPatient(null);
      setDiagnosticos([]);
      setExamenes(['']);

      toast({
        title: 'Éxito',
        description: 'Interconsulta creada correctamente',
      });
    } catch (error) {
      console.error('❌ Error completo:', error);
      
      let errorTitle = 'Error al crear la Interconsulta';
      let errorDescription = 'Ocurrió un error inesperado';
      
      if (error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        const serverData = (error.response as { data: unknown }).data;
        console.error('Detalles del error del servidor:', serverData);
        
        if (serverData && typeof serverData === 'object') {
          // Manejar diferentes formatos de error del servidor
          const errorObj = serverData as Record<string, unknown>;
          if (errorObj.message) {
            if (Array.isArray(errorObj.message)) {
              errorDescription = `Errores de validación: ${(errorObj.message as string[]).join(', ')}`;
            } else if (typeof errorObj.message === 'string') {
              errorDescription = errorObj.message;
            }
          }
          
          if (errorObj.error && typeof errorObj.error === 'string') {
            const statusCode = typeof errorObj.statusCode === 'number' ? errorObj.statusCode : '';
            errorTitle = `Error ${statusCode}: ${errorObj.error}`;
          }
        }
      } else if (error instanceof Error) {
        errorDescription = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: errorTitle,
        description: errorDescription,
        duration: 8000, // Mostrar por más tiempo para errores importantes
      });
    }
  };
  
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                  <Hospital className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Interconsulta Médica
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Solicitud de Consulta Especializada
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {selectedPatient && (
                  <Badge variant="secondary" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{selectedPatient.name} {selectedPatient.lastName}</span>
                  </Badge>
                )}
                <PatientSelector onSelect={handlePatientSelect} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedPatient(null);
                    setDiagnosticos([{ desc: '', cie: '', cif: '', presuntivo: false, definitivo: false }]);
                    setExamenes(['']);
                  }}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpiar</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sección A: Datos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>A. Datos Básicos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroDeArchivo" className="text-sm font-medium">
                    Número de Archivo *
                  </Label>
                  <Input
                    id="numeroDeArchivo"
                    type="number"
                    {...register('numeroDeArchivo', { valueAsNumber: true })}
                    className={errors.numeroDeArchivo ? "border-red-500" : ""}
                  />
                  {errors.numeroDeArchivo && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.numeroDeArchivo.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha" className="text-sm font-medium flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Fecha *</span>
                  </Label>
                  <Input
                    id="fecha"
                    type="date"
                    {...register('fecha')}
                    className={errors.fecha ? "border-red-500" : ""}
                  />
                  {errors.fecha && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.fecha.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección B: Detalles de la Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-gray-600" />
                <span>B. Detalles de la Consulta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motivoConsulta" className="text-sm font-medium">
                    Motivo de Consulta *
                  </Label>
                  <Textarea
                    id="motivoConsulta"
                    {...register('motivoConsulta')}
                    className={`min-h-[100px] ${errors.motivoConsulta ? "border-red-500" : ""}`}
                    placeholder="Describa el motivo de la interconsulta..."
                  />
                  {errors.motivoConsulta && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.motivoConsulta.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="servicio" className="text-sm font-medium">
                      Servicio *
                    </Label>
                    <select
                      id="servicio"
                      {...register('servicio')}
                      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.servicio ? "border-red-500" : ""}`}
                    >
                      <option value="EMERGENCIA">Emergencia</option>
                      <option value="CONSULTA EXTERNA">Consulta Externa</option>
                      <option value="HOSPITALIZACIÓN">Hospitalización</option>
                    </select>
                    {errors.servicio && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.servicio.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="especialidadConsultada" className="text-sm font-medium">
                      Especialidad Consultada *
                    </Label>
                    <Input
                      id="especialidadConsultada"
                      {...register('especialidadConsultada')}
                      className={errors.especialidadConsultada ? "border-red-500" : ""}
                      placeholder="Ej: Cardiología, Neurología..."
                    />
                    {errors.especialidadConsultada && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.especialidadConsultada.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="esUrgente"
                      {...register('esUrgente')}
                    />
                    <Label htmlFor="esUrgente" className="text-sm font-medium flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span>Es Urgente</span>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección C: Cuadro Clínico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-gray-600" />
                <span>C. Cuadro Clínico Actual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="cuadroClinicoActual" className="text-sm font-medium">
                  Cuadro Clínico Actual *
                </Label>
                <Textarea
                  id="cuadroClinicoActual"
                  {...register('cuadroClinicoActual')}
                  className={`min-h-[120px] ${errors.cuadroClinicoActual ? "border-red-500" : ""}`}
                  placeholder="Describa detalladamente el cuadro clínico actual del paciente..."
                />
                {errors.cuadroClinicoActual && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.cuadroClinicoActual.message}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sección D: Diagnóstico General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-gray-600" />
                <span>D. Diagnóstico General</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="diagnosticoGeneral" className="text-sm font-medium">
                  Diagnóstico General *
                </Label>
                <Input
                  id="diagnosticoGeneral"
                  {...register('diagnosticoGeneral')}
                  className={errors.diagnosticoGeneral ? "border-red-500" : ""}
                  placeholder="Diagnóstico principal o impresión clínica..."
                />
                {errors.diagnosticoGeneral && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.diagnosticoGeneral.message}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sección: Diagnósticos Dinámicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-gray-600" />
                  <span>Diagnósticos Específicos</span>
                </div>
                <Button
                  type="button"
                  onClick={agregarDiagnostico}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Diagnóstico</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {diagnosticos.map((diag, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Diagnóstico {index + 1}</h5>
                    {diagnosticos.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarDiagnostico(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Descripción</Label>
                      <Input
                        value={diag.desc}
                        onChange={(e) => {
                          const nuevosDiagnosticos = [...diagnosticos];
                          nuevosDiagnosticos[index].desc = e.target.value;
                          setDiagnosticos(nuevosDiagnosticos);
                        }}
                        placeholder="Ej: Hipertensión esencial"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Código CIE-10</Label>
                      <AutocompleteCIE
                        onSelect={(cie, desc) => {
                          const nuevosDiagnosticos = [...diagnosticos];
                          nuevosDiagnosticos[index].cie = cie;
                          if (!nuevosDiagnosticos[index].desc) {
                            nuevosDiagnosticos[index].desc = desc;
                          }
                          setDiagnosticos(nuevosDiagnosticos);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Código CIF</Label>
                      <AutocompleteCIF
                        onSelect={(cif) => {
                          const nuevosDiagnosticos = [...diagnosticos];
                          nuevosDiagnosticos[index].cif = cif;
                          setDiagnosticos(nuevosDiagnosticos);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`presuntivo-${index}`}
                        checked={diag.presuntivo || false}
                        onCheckedChange={(checked) => {
                          const nuevosDiagnosticos = [...diagnosticos];
                          nuevosDiagnosticos[index].presuntivo = checked as boolean;
                          setDiagnosticos(nuevosDiagnosticos);
                        }}
                      />
                      <Label htmlFor={`presuntivo-${index}`} className="text-sm">
                        Presuntivo
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`definitivo-${index}`}
                        checked={diag.definitivo || false}
                        onCheckedChange={(checked) => {
                          const nuevosDiagnosticos = [...diagnosticos];
                          nuevosDiagnosticos[index].definitivo = checked as boolean;
                          setDiagnosticos(nuevosDiagnosticos);
                        }}
                      />
                      <Label htmlFor={`definitivo-${index}`} className="text-sm">
                        Definitivo
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sección: Exámenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Microscope className="w-5 h-5 text-gray-600" />
                  <span>Exámenes y Resultados</span>
                </div>
                <Button
                  type="button"
                  onClick={agregarExamen}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Examen</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {examenes.map((examen, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <Input
                      value={examen}
                      onChange={(e) => {
                        const nuevosExamenes = [...examenes];
                        nuevosExamenes[index] = e.target.value;
                        setExamenes(nuevosExamenes);
                      }}
                      placeholder="Ej: Hemograma completo, Glicemia, etc."
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => eliminarExamen(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sección E: Plan de Tratamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-gray-600" />
                <span>E. Plan de Tratamiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="planTratamiento" className="text-sm font-medium">
                  Plan de Tratamiento *
                </Label>
                <Textarea
                  id="planTratamiento"
                  {...register('planTratamiento')}
                  className={`min-h-[120px] ${errors.planTratamiento ? "border-red-500" : ""}`}
                  placeholder="Describa el plan de tratamiento actual..."
                />
                {errors.planTratamiento && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.planTratamiento.message}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sección F: Planes Propuestos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-gray-600" />
                <span>F. Planes Propuestos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planDiagnosticoPropuesto" className="text-sm font-medium">
                    Plan Diagnóstico Propuesto
                  </Label>
                  <Textarea
                    id="planDiagnosticoPropuesto"
                    {...register('planDiagnosticoPropuesto')}
                    className="min-h-[100px]"
                    placeholder="Estudios y exámenes adicionales sugeridos..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planTerapeuticoPropuesto" className="text-sm font-medium">
                    Plan Terapéutico Propuesto *
                  </Label>
                  <Textarea
                    id="planTerapeuticoPropuesto"
                    {...register('planTerapeuticoPropuesto')}
                    className={`min-h-[100px] ${errors.planTerapeuticoPropuesto ? "border-red-500" : ""}`}
                    placeholder="Tratamiento específico recomendado..."
                  />
                  {errors.planTerapeuticoPropuesto && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.planTerapeuticoPropuesto.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección G: Cuadro Clínico Interconsulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <span>G. Cuadro Clínico de Interconsulta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="cuadroClinicoInterconsulta" className="text-sm font-medium">
                  Cuadro Clínico de Interconsulta
                </Label>
                <Textarea
                  id="cuadroClinicoInterconsulta"
                  {...register('cuadroClinicoInterconsulta')}
                  className="min-h-[120px]"
                  placeholder="Aspectos específicos a evaluar por el especialista..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedPatient(null);
                    setDiagnosticos([{ desc: '', cie: '', cif: '', presuntivo: false, definitivo: false }]);
                    setExamenes(['']);
                  }}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpiar Formulario</span>
                </Button>
                
                <Button
                  type="submit"
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Crear Interconsulta</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
