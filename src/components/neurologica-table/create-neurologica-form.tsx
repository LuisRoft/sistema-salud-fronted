'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getSession } from 'next-auth/react';
import { createNeurologica } from '@/services/neurologicaService';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { CreateNeurologicaRequest } from '@/types/neurologica';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, X, Users, Brain, RotateCcw } from 'lucide-react';
import { useCallback } from 'react';
import Image from 'next/image';
import { BioDigitalEmbedded } from '@/components/BioDigitalEmbedded';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PatientSelector } from '../shared/patient-selector';
import { Patient } from '@/services/patientService';
import AutocompleteCIF from '../cif/autocompleteCIF';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  ci: z.string().min(1, 'Cédula requerida'),
  edad: z.coerce.number().min(0, 'Edad inválida'),
  diagnostico: z.string().min(1, 'Campo requerido'),
  discapacidad: z.string().min(1, 'Campo requerido'),
  antecedentesHeredofamiliares: z.string().optional(),
  antecedentesFarmacologicos: z.string().optional(),
  historiaNutricional: z.string().optional(),
  alergias: z.string().optional(),
  habitosToxicos: z.string().optional(),
  quirurgico: z.string().optional(),
  comunicacion: z.string().optional(),
  dolor: z.string().optional(),
  utilizaSillaRuedas: z.boolean().default(false),
  amnesis: z.string().optional(),
  inicioEvolucion: z.string().optional(),
  entornoFamiliar: z.string().optional(),
  // Nuevas secciones de evaluación funcional
  alteracionesMarcha: z.object({
    marchaTrendelenburg: z.boolean().default(false),
    marchaTuerca: z.boolean().default(false),
    marchaAtaxica: z.boolean().default(false),
    marchaSegador: z.boolean().default(false),
    marchaTijeras: z.boolean().default(false),
    marchaTabetica: z.boolean().default(false),
    marchaCoreica: z.boolean().default(false),
    marchaDistonica: z.boolean().default(false),
    otrasAlteraciones: z.string().optional(),
  }),
  riesgoCaida: z.object({
    tiempoTimedUpGo: z.string().optional(),
    riesgoEvaluado: z.string().optional(),
    comentariosRiesgo: z.string().optional(),
  }),
  alcanceMotor: z.string().optional(),
  comentariosExaminador: z.string().optional(),
  resumenResultados: z.string().optional(),
  cif: z.array(z.string()).optional(),
  diagnosticoFisioterapeutico: z.string().optional(),
  planFisioterapeutico: z.string().optional(),
});

type FormValues = CreateNeurologicaRequest;

const barthelItems = [
  {
    key: 'vestirse',
    label: 'Vestirse',
    options: [
      { label: 'Independiente: capaz de ponerse y de quitarse la ropa, abotonarse, atarse los zapatos', value: 10 },
      { label: 'Necesita ayuda', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'arreglarse',
    label: 'Arreglarse',
    options: [
      { label: 'Independiente para lavarse la cara, las manos, peinarse, afeitarse, maquillarse, etc.', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'deposicion',
    label: 'Deposición',
    options: [
      { label: 'Continencia normal', value: 10 },
      { label: 'Ocasionalmente algún episodio de incontinencia, o necesita ayuda para administrar supositorios o lavativas', value: 5 },
      { label: 'Incontinente', value: 0 },
    ],
  },
  {
    key: 'miccion',
    label: 'Micción',
    options: [
      { label: 'Continencia normal, o es capaz de cuidarse de la sonda si tiene una puesta', value: 10 },
      { label: '1-2 episodios diarios como máximo de incontinencia, o necesita ayuda para cuidar de la sonda', value: 5 },
      { label: 'Incontinente', value: 0 },
    ],
  },
  {
    key: 'usoRetrete',
    label: 'Uso del retrete',
    options: [
      { label: 'Independiente para ir al cuarto de aseo, quitarse y ponerse la ropa', value: 10 },
      { label: 'Necesita ayuda física o supervisión para hacerlo, pero se limpia solo', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'trasladarse',
    label: 'Trasladarse',
    options: [
      { label: 'Independiente para ir de la silla a la cama', value: 15 },
      { label: 'Mínima ayuda física o supervisión para hacerlo', value: 10 },
      { label: 'Necesita gran ayuda, pero puede mantenerse sentado solo', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'deambular',
    label: 'Deambular',
    options: [
      { label: 'Independiente para caminar 50 metros', value: 15 },
      { label: 'Necesita ayuda física o supervisión para caminar 50 metros', value: 10 },
      { label: 'Independiente en silla de ruedas en 50 metros', value: 5 },
      { label: 'Inmóvil', value: 0 },
    ],
  },
  {
    key: 'escaleras',
    label: 'Escaleras',
    options: [
      { label: 'Independiente para bajar y subir escaleras', value: 10 },
      { label: 'Necesita ayuda física o supervisión para hacerlo', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
];

// ImageUpload component
interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  currentImage: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageChange, currentImage }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageChange(acceptedFiles[0]);
    }
  }, [onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <Card className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-4">
        {currentImage ? (
          <div className="relative">
            <Image
              src={currentImage}
              alt="Uploaded"
              width={300}
              height={192}
              className="w-full h-48 object-cover rounded border border-gray-200 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-md"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {isDragActive
                    ? 'Suelta la imagen aquí...'
                    : 'Arrastra una imagen aquí o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Formatos: JPG, PNG, GIF (máx. 10MB)
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function CreateNeurologicaForm({ onClose }: { onClose: () => void }) {
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      alteracionesMarcha: {
        marchaTrendelenburg: false,
        marchaTuerca: false,
        marchaAtaxica: false,
        marchaSegador: false,
        marchaTijeras: false,
        marchaTabetica: false,
        marchaCoreica: false,
        marchaDistonica: false,
        otrasAlteraciones: '',
      },
      riesgoCaida: {
        tiempoTimedUpGo: '',
        riesgoEvaluado: '',
        comentariosRiesgo: '',
      },
      alcanceMotor: '',
      comentariosExaminador: '',
      resumenResultados: '',
      evaluacionDolor: {
        localizacion: '',
        tiempo: '',
        irradiado: '',
        tipo: '',
        escalaVisualNumerica: 0,
        escalaSubjetiva: '',
        actividadesAlivian: '',
        actividadesAgravan: '',
        comentariosDolor: '',
      },
      cif: [],
      diagnosticoFisioterapeutico: '',
      planFisioterapeutico: '',
    }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [barthel, setBarthel] = useState<{ [key: string]: number }>({});
  const totalBarthel = Object.values(barthel).reduce((a, b) => a + b, 0);

  // Estado para las imágenes del screening postural
  const [screeningImages, setScreeningImages] = useState<{
    vistaAnterior: string | null;
    vistaPosterior: string | null;
    vistaLateralDerecha: string | null;
    vistaLateralIzquierda: string | null;
  }>({
    vistaAnterior: null,
    vistaPosterior: null,
    vistaLateralDerecha: null,
    vistaLateralIzquierda: null,
  });

  // Estado para la evaluación de dolor (solo frontend, no se envía al backend)
  const [evaluacionDolor, setEvaluacionDolor] = useState({
    localizacion: '',
    tiempo: '',
    irradiado: '',
    tipo: '',
    escalaVisualNumerica: 0,
    escalaSubjetiva: '',
    actividadesAlivian: '',
    actividadesAgravan: '',
    comentariosDolor: '',
  });

  // Estado para el Mini Mental Test (solo frontend, no se envía al backend)
  const [miniMental, setMiniMental] = useState<{ [key: string]: number }>({});
  const totalMiniMental = Object.values(miniMental).reduce((a, b) => a + b, 0);

  // Estado para CIF seleccionados
  const [selectedCIFs, setSelectedCIFs] = useState<Array<{codigo: string, descripcion: string}>>([]);

  // Función para manejar la carga de imágenes
  const handleImageUpload = (type: keyof typeof screeningImages, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreeningImages(prev => ({
          ...prev,
          [type]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setScreeningImages(prev => ({
        ...prev,
        [type]: null
      }));
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const session = await getSession();
      const token = session?.user.access_token;
      if (!token) throw new Error('Token no disponible');
      
      // Incluir los datos del índice de Barthel en el envío
      const dataToSend = {
        ...values,
        barthel: {
          vestirse: barthel.vestirse,
          arreglarse: barthel.arreglarse,
          deposicion: barthel.deposicion,
          miccion: barthel.miccion,
          usoRetrete: barthel.usoRetrete,
          trasladarse: barthel.trasladarse,
          deambular: barthel.deambular,
          escaleras: barthel.escaleras,
        }
      };
      
      return await createNeurologica(dataToSend, token);
    },
    onSuccess: () => {
      toast({ title: 'Éxito', description: 'Evaluación registrada correctamente' });
      queryClient.invalidateQueries({ queryKey: ['neurologicas'] });
      onClose();
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    },
  });

  // Función para manejar la selección de paciente
  const handlePatientSelect = (patient: Patient) => {
    console.log('Paciente seleccionado:', patient);
    setSelectedPatient(patient);
    
    // Actualizar los campos del formulario con los datos del paciente
    form.setValue('name', `${patient.name} ${patient.lastName}`);
    form.setValue('ci', patient.document);
    
    // Calcular edad si hay fecha de nacimiento
    if (patient.birthday) {
      const birthDate = new Date(patient.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        form.setValue('edad', age - 1);
      } else {
        form.setValue('edad', age);
      }
    }
  };

  // Función para limpiar la selección de paciente
  const handleClearPatient = () => {
    setSelectedPatient(null);
    form.setValue('name', '');
    form.setValue('ci', '');
    form.setValue('edad', 0);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Evaluación Neurológica
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Evaluación funcional y neurológica completa
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
                  onClick={handleClearPatient}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpiar</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <h4 className='font-semibold text-lg col-span-full text-gray-800 dark:text-gray-100'>Datos Personales</h4>

          <FormField name='name' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Nombre</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name='ci' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Cédula</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name='edad' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Edad</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' type='number' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name='discapacidad' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Discapacidad</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name='diagnostico' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Diagnóstico Médico</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>II. ANTECEDENTES CLÍNICOS</h4>
          </div>
          <FormField name='antecedentesHeredofamiliares' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Antecedentes Heredofamiliares</FormLabel>
              <FormControl>
                <Textarea className='min-h-[100px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} />
              </FormControl>
            </FormItem>
          )} />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='col-span-full border-b border-gray-200 dark:border-gray-700 pb-3 mb-4'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>III. INFORMACIÓN MÉDICA ADICIONAL</h4>
          </div>
          <FormField name='antecedentesFarmacologicos' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Antecedentes Farmacológicos</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='historiaNutricional' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Historia Nutricional</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='alergias' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Alergias</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='habitosToxicos' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Hábitos Tóxicos</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='quirurgico' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Quirúrgico</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='comunicacion' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Comunicación</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='dolor' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300'>Dolor</FormLabel>
              <FormControl><Input className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' {...field} /></FormControl>
            </FormItem>
          )} />

          <FormField name='utilizaSillaRuedas' control={form.control} render={({ field }) => (
            <FormItem className='flex items-center space-x-2'>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className='mb-0 text-gray-700 dark:text-gray-300'>Utiliza silla de ruedas</FormLabel>
            </FormItem>
          )} />
        </div>

        {/* Sección Amnesis */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>IV. Amnesis</h4>
          </div>
          <FormField name='amnesis' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>Descripción de la amnesis</FormLabel>
              <FormControl>
                <Textarea 
                  className='min-h-[100px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                  placeholder='Describa la amnesis...' 
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )} />
          
          <div className='grid grid-cols-1 gap-4'>
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600'>
              <h5 className='font-medium text-gray-800 dark:text-gray-100 mb-3'>• INICIO Y EVOLUCIÓN DEL CUADRO CLÍNICO</h5>
              <FormField name='inicioEvolucion' control={form.control} render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      className='min-h-[80px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                      placeholder='Describa el inicio y evolución del cuadro clínico...' 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200'>
              <h5 className='font-medium text-gray-800 dark:text-gray-100 mb-3'>• ENTORNO FAMILIAR Y SOCIAL</h5>
              <FormField name='entornoFamiliar' control={form.control} render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                      placeholder='Describa el entorno familiar y social...' 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )} />
            </div>
          </div>
        </div>

        {/* SECCIÓN: VALORACIÓN FISIOTERAPÉUTICA */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>V. VALORACIÓN FISIOTERAPÉUTICA</h4>
          </div>
          
          <div className='space-y-6'>
            <div>
              <h5 className='font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4'>V.I MAPA CORPORAL</h5>
              <div className='bg-blue-50 border border-blue-200 p-6 rounded-lg'>
                <p className='text-sm mb-4 text-gray-700 dark:text-gray-300 font-medium'>
                  <strong>Indique que región del cuerpo presenta limitación, incapacidad en caso de dolor señale de acuerdo a lo siguiente:</strong>
                </p>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3 p-2 bg-white rounded border'>
                      <div className='w-4 h-4 bg-blue-600 rounded border border-gray-300'></div>
                      <span className='text-gray-700'>• Dolor nº 1: <strong>azul</strong></span>
                    </div>
                    <div className='flex items-center gap-3 p-2 bg-white rounded border'>
                      <div className='w-4 h-4 bg-green-600 rounded border border-gray-300'></div>
                      <span className='text-gray-700'>• Zonas con alteración de sensibilidad: <strong>verde</strong></span>
                    </div>
                    <div className='flex items-center gap-3 p-2 bg-white rounded border'>
                      <div className='w-4 h-4 bg-red-600 rounded border border-gray-300'></div>
                      <span className='text-gray-700'>• Dolor nº 2: <strong>rojo</strong></span>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3 p-2 bg-white rounded border'>
                      <div className='w-4 h-4 border-2 border-gray-600 rounded-full bg-white'></div>
                      <span className='text-gray-700'>• Screening o estructuras relacionadas: <strong>círculo</strong></span>
                    </div>
                    <div className='flex items-center gap-3 p-2 bg-white rounded border'>
                      <div className='w-4 h-4 bg-black rounded border border-gray-300'></div>
                      <span className='text-gray-700'>• Dolor nº 3: <strong>negro</strong></span>
                    </div>
                    <div className='text-xs text-gray-600 ml-6 italic'>
                      (Periarticulares, Intraarticulares, Neural, Discogénico)
                    </div>
                  </div>
                </div>

                <div className='bg-white p-4 rounded border border-gray-200'>
                  <h6 className='font-medium mb-3 text-gray-800 dark:text-gray-100'>Regiones corporales a evaluar:</h6>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700'>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>CARA: DIVIDIR EN 4</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>CUELLO</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>HOMBROS</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>BRAZOS</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>ANTEBRAZO</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>MANO: MANO Y DEDOS</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>TORSO: DERECHO-IZQUIERDA</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>ABDOMEN: DIVIDIR EN 4</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-2 h-2 bg-gray-400 rounded-full'></span>
                      <span>CADERA: EN DOS IZQUIERDA Y DERECHA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modelo Humano BioDigital */}
            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
              <h6 className='font-medium mb-4 text-center text-gray-800 dark:text-gray-100 text-lg'>MODELO ANATÓMICO INTERACTIVO</h6>
              <div className='min-h-[600px] border border-gray-200 rounded-lg p-4 bg-gray-50 dark:bg-gray-700'>
                <BioDigitalEmbedded />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN: SCREENING POSTURAL */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>VII. Screening Postural</h4>
            <p className='text-sm text-gray-600 mt-1'>Carga de imágenes para evaluación postural</p>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Vista Anterior */}
            <div className='space-y-3'>
              <div className='bg-blue-50 border border-blue-200 py-3 px-4 rounded-md'>
                <h5 className='font-medium text-center text-blue-800'>VISTA ANTERIOR</h5>
              </div>
              <ImageUpload 
                onImageChange={(file) => handleImageUpload('vistaAnterior', file)}
                currentImage={screeningImages.vistaAnterior}
              />
            </div>

            {/* Vista Posterior */}
            <div className='space-y-3'>
              <div className='bg-green-50 border border-green-200 py-3 px-4 rounded-md'>
                <h5 className='font-medium text-center text-green-800'>VISTA POSTERIOR</h5>
              </div>
              <ImageUpload 
                onImageChange={(file) => handleImageUpload('vistaPosterior', file)}
                currentImage={screeningImages.vistaPosterior}
              />
            </div>

            {/* Vista Lateral Derecha */}
            <div className='space-y-3'>
              <div className='bg-orange-50 border border-orange-200 py-3 px-4 rounded-md'>
                <h5 className='font-medium text-center text-orange-800'>VISTA LATERAL DERECHA</h5>
              </div>
              <ImageUpload 
                onImageChange={(file) => handleImageUpload('vistaLateralDerecha', file)}
                currentImage={screeningImages.vistaLateralDerecha}
              />
            </div>

            {/* Vista Lateral Izquierda */}
            <div className='space-y-3'>
              <div className='bg-purple-50 border border-purple-200 py-3 px-4 rounded-md'>
                <h5 className='font-medium text-center text-purple-800'>VISTA LATERAL IZQUIERDA</h5>
              </div>
              <ImageUpload 
                onImageChange={(file) => handleImageUpload('vistaLateralIzquierda', file)}
                currentImage={screeningImages.vistaLateralIzquierda}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN: V.III DOLOR */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>V.III DOLOR</h4>
            <p className='text-sm text-blue-600 mt-1 italic'>
              (En caso de no existir en el mapa corporal omitir - Sección adicional por cada una seleccionada en el cuerpo humano)
            </p>
          </div>
          
          <div className=''>
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden'>
                <tbody>
                  {/* Localización */}
                  <tr className='border-b border-gray-200'>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium w-1/4'>
                      <div className='text-gray-800 dark:text-gray-100'>
                        <div className='font-semibold'>LOCALIZACIÓN</div>
                        <div className='text-sm text-gray-600'>(REGIÓN)</div>
                      </div>
                    </td>
                    <td className='px-6 py-4 w-3/4'>
                      <Input 
                        value={evaluacionDolor.localizacion}
                        onChange={(e) => setEvaluacionDolor(prev => ({ ...prev, localizacion: e.target.value }))}
                        placeholder='Especifique la región afectada...'
                        className='w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      />
                    </td>
                  </tr>

                  {/* Tiempo */}
                  <tr className='border-b border-gray-200'>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium w-1/4'>
                      <div className='text-gray-800 dark:text-gray-100'>
                        <div className='font-semibold'>TIEMPO</div>
                        <span className='inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs mt-1'>CHECK</span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='max-w-md'>
                        <FormField name='evaluacionDolor.tiempo' control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                                  <SelectValue placeholder='Seleccionar tipo' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='agudo'>AGUDO</SelectItem>
                                  <SelectItem value='cronico'>CRÓNICO</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </td>
                  </tr>

                  {/* Irradiado */}
                  <tr className='border-b border-gray-200'>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium w-1/4'>
                      <div className='text-gray-800 dark:text-gray-100'>IRRADIADO</div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='max-w-md'>
                        <FormField name='evaluacionDolor.irradiado' control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                                  <SelectValue placeholder='Seleccionar opción' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='si'>SÍ</SelectItem>
                                  <SelectItem value='no'>NO</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </td>
                  </tr>

                  {/* Tipo */}
                  <tr className='border-b border-gray-200'>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium w-1/4'>
                      <div className='text-gray-800 dark:text-gray-100'>TIPO</div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='max-w-md'>
                        <FormField name='evaluacionDolor.tipo' control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                                  <SelectValue placeholder='Seleccionar tipo' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='superficial'>SUPERFICIAL</SelectItem>
                                  <SelectItem value='profundo'>PROFUNDO</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </td>
                  </tr>

                  {/* Escala Visual Numérica */}
                  <tr className='border-b border-gray-200'>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium w-1/4'>
                      <div className='text-gray-800 dark:text-gray-100'>
                        <div className='font-semibold'>ESCALA VISUAL</div>
                        <div className='font-semibold'>NUMÉRICA</div>
                        <span className='inline-block bg-green-600 text-white px-2 py-1 rounded text-xs mt-1'>ESCALA</span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='space-y-4'>
                        <FormField name='evaluacionDolor.escalaVisualNumerica' control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className='space-y-4'>
                                <input
                                  type='range'
                                  min='0'
                                  max='10'
                                  step='1'
                                  value={field.value || 0}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  className='w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
                                />
                                <div className='flex justify-between text-xs text-gray-600'>
                                  <span className='text-center'>0<br /><span className='text-green-600 font-medium'>Sin dolor</span></span>
                                  <span>1</span>
                                  <span>2</span>
                                  <span>3</span>
                                  <span>4</span>
                                  <span>5</span>
                                  <span>6</span>
                                  <span>7</span>
                                  <span>8</span>
                                  <span>9</span>
                                  <span className='text-center'>10<br /><span className='text-red-600 font-medium'>Peor dolor<br />imaginable</span></span>
                                </div>
                                <div className='text-center p-3 bg-gray-100 border border-gray-300 rounded-md'>
                                  <span className='text-sm font-medium text-gray-700'>Nivel de dolor seleccionado: </span>
                                  <span className='text-lg font-bold text-gray-900'>{field.value || 0}</span>
                                </div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </td>
                  </tr>

                  {/* Escala Subjetiva del Dolor */}
                  <tr className='border-b border-gray-200'>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium w-1/4'>
                      <div className='text-gray-800 dark:text-gray-100'>
                        <div className='font-semibold'>ESCALA SUBJETIVA</div>
                        <div className='font-semibold'>DEL DOLOR</div>
                        <span className='inline-block bg-purple-600 text-white px-2 py-1 rounded text-xs mt-1'>CHECK</span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='max-w-md'>
                        <FormField name='evaluacionDolor.escalaSubjetiva' control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                                  <SelectValue placeholder='Seleccionar nivel' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='sin_dolor'>0 SIN DOLOR</SelectItem>
                                  <SelectItem value='dolor_muy_leve'>1 DOLOR MUY LEVE</SelectItem>
                                  <SelectItem value='dolor_leve'>2 DOLOR LEVE</SelectItem>
                                  <SelectItem value='dolor_leve_moderado'>3 DOLOR LEVE-MODERADO</SelectItem>
                                  <SelectItem value='dolor_moderado'>4 DOLOR MODERADO</SelectItem>
                                  <SelectItem value='dolor_moderado_fuerte'>5 DOLOR MODERADO-FUERTE</SelectItem>
                                  <SelectItem value='dolor_fuerte'>6 DOLOR FUERTE</SelectItem>
                                  <SelectItem value='dolor_muy_fuerte'>7 DOLOR MUY FUERTE</SelectItem>
                                  <SelectItem value='dolor_intenso'>8 DOLOR INTENSO</SelectItem>
                                  <SelectItem value='dolor_muy_intenso'>9 DOLOR MUY INTENSO</SelectItem>
                                  <SelectItem value='peor_dolor'>10 PEOR DOLOR IMAGINABLE</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </td>
                  </tr>

                  {/* Actividades que alivian */}
                  <tr className='border-b border-gray-200'>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium'>
                      <div className='text-gray-800 dark:text-gray-100'>
                        <div className='font-semibold'>ACTIVIDADES QUE</div>
                        <div className='font-semibold'>ALIVIAN</div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <FormField name='evaluacionDolor.actividadesAlivian' control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder='Describa las actividades que alivian el dolor...'
                              className='min-h-[80px] resize-none border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                            />
                          </FormControl>
                        </FormItem>
                      )} />
                    </td>
                  </tr>

                  {/* Actividades que agravan */}
                  <tr className='border-b border-gray-200'>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium'>
                      <div className='text-gray-800 dark:text-gray-100'>
                        <div className='font-semibold'>ACTIVIDADES QUE</div>
                        <div className='font-semibold'>AGRAVAN</div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <FormField name='evaluacionDolor.actividadesAgravan' control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder='Describa las actividades que agravan el dolor...'
                              className='min-h-[80px] resize-none border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                            />
                          </FormControl>
                        </FormItem>
                      )} />
                    </td>
                  </tr>

                  {/* Comentarios */}
                  <tr>
                    <td className='border-r border-gray-300 px-6 py-4 bg-gray-50 dark:bg-gray-700 font-medium'>
                      <div className='text-gray-800 dark:text-gray-100 font-semibold'>COMENTARIOS</div>
                    </td>
                    <td className='px-6 py-4'>
                      <FormField name='evaluacionDolor.comentariosDolor' control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder='No refiere dolor ni alteración de sensibilidad específica regional'
                              className='min-h-[80px] resize-none border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                            />
                          </FormControl>
                        </FormItem>
                      )} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECCIÓN: ALTERACIONES DE LA MARCHA */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>VIII. ALTERACIONES DE LA MARCHA</h4>
            <span className='bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium'>EVALUACIÓN</span>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField name='alteracionesMarcha.marchaTrendelenburg' control={form.control} render={({ field }) => (
              <FormItem className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className='h-5 w-5' />
                </FormControl>
                <FormLabel className='mb-0 text-gray-700 dark:text-gray-300 font-medium cursor-pointer'>MARCHA DE TRENDELEMBURG</FormLabel>
              </FormItem>
            )} />

            <FormField name='alteracionesMarcha.marchaTuerca' control={form.control} render={({ field }) => (
              <FormItem className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className='h-5 w-5' />
                </FormControl>
                <FormLabel className='mb-0 text-gray-700 dark:text-gray-300 font-medium cursor-pointer'>MARCHA EN TUERCA</FormLabel>
              </FormItem>
            )} />

            <FormField name='alteracionesMarcha.marchaAtaxica' control={form.control} render={({ field }) => (
              <FormItem className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className='h-5 w-5' />
                </FormControl>
                <FormLabel className='mb-0 text-gray-700 dark:text-gray-300 font-medium cursor-pointer'>MARCHA ATÁXICA</FormLabel>
              </FormItem>
            )} />

            <FormField name='alteracionesMarcha.marchaSegador' control={form.control} render={({ field }) => (
              <FormItem className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className='h-5 w-5' />
                </FormControl>
                <FormLabel className='mb-0 text-gray-700 dark:text-gray-300 font-medium cursor-pointer'>MARCHA EN SEGADOR</FormLabel>
              </FormItem>
            )} />

            <FormField name='alteracionesMarcha.marchaTijeras' control={form.control} render={({ field }) => (
              <FormItem className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className='h-5 w-5' />
                </FormControl>
                <FormLabel className='mb-0 text-gray-700 dark:text-gray-300 font-medium cursor-pointer'>MARCHA EN TIJERAS</FormLabel>
              </FormItem>
            )} />

            <FormField name='alteracionesMarcha.marchaTabetica' control={form.control} render={({ field }) => (
              <FormItem className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className='h-5 w-5' />
                </FormControl>
                <FormLabel className='mb-0 text-gray-700 dark:text-gray-300 font-medium cursor-pointer'>MARCHA TABÉTICA</FormLabel>
              </FormItem>
            )} />

            <FormField name='alteracionesMarcha.marchaCoreica' control={form.control} render={({ field }) => (
              <FormItem className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className='h-5 w-5' />
                </FormControl>
                <FormLabel className='mb-0 text-gray-700 dark:text-gray-300 font-medium cursor-pointer'>MARCHA COREICA</FormLabel>
              </FormItem>
            )} />

            <FormField name='alteracionesMarcha.marchaDistonica' control={form.control} render={({ field }) => (
              <FormItem className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className='h-5 w-5' />
                </FormControl>
                <FormLabel className='mb-0 text-gray-700 dark:text-gray-300 font-medium cursor-pointer'>MARCHA DISTÓNICA</FormLabel>
              </FormItem>
            )} />
          </div>

          <FormField name='alteracionesMarcha.otrasAlteraciones' control={form.control} render={({ field }) => (
            <FormItem className='bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg p-4'>
              <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>OTRAS ALTERACIONES</FormLabel>
              <FormControl>
                <Input 
                  className='mt-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                  placeholder='Especifique otras alteraciones de la marcha...' 
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )} />
        </div>

        {/* SECCIÓN: RIESGO DE CAÍDA - TIMED UP AND GO */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>IX. RIESGO DE CAÍDA: TIMED UP AND GO</h4>
            <span className='bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium'>EVALUACIÓN</span>
          </div>

          {/* Criterios de evaluación */}
          <div className='space-y-4'>
            <h5 className='font-medium text-gray-800 dark:text-gray-100 text-lg'>Seleccione el nivel de riesgo:</h5>
            
            <FormField name='riesgoCaida.riesgoEvaluado' control={form.control} render={({ field }) => (
              <FormItem className='space-y-4'>
                <div className='grid grid-cols-1 gap-3'>
                  <label className='flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors'>
                    <input
                      type='radio'
                      name='riesgoEvaluado'
                      value='bajo'
                      checked={field.value === 'bajo'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className='w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500'
                    />
                    <div>
                      <span className='text-gray-800 dark:text-gray-100 font-medium'>• &lt; 10 segundos</span>
                      <div className='text-sm text-gray-600'>Movilidad normal, bajo riesgo de caída</div>
                    </div>
                  </label>
                  
                  <label className='flex items-center space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors'>
                    <input
                      type='radio'
                      name='riesgoEvaluado'
                      value='moderado'
                      checked={field.value === 'moderado'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className='w-5 h-5 text-yellow-600 border-gray-300 focus:ring-yellow-500'
                    />
                    <div>
                      <span className='text-gray-800 dark:text-gray-100 font-medium'>• 10-20 segundos</span>
                      <div className='text-sm text-gray-600'>Movilidad aceptable, riesgo moderado</div>
                    </div>
                  </label>
                  
                  <label className='flex items-center space-x-4 p-4 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors'>
                    <input
                      type='radio'
                      name='riesgoEvaluado'
                      value='alto'
                      checked={field.value === 'alto'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className='w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500'
                    />
                    <div>
                      <span className='text-gray-800 dark:text-gray-100 font-medium'>• &gt; 20 segundos</span>
                      <div className='text-sm text-gray-600'>Movilidad reducida, alto riesgo de caída</div>
                    </div>
                  </label>
                  
                  <label className='flex items-center space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors'>
                    <input
                      type='radio'
                      name='riesgoEvaluado'
                      value='dependencia'
                      checked={field.value === 'dependencia'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className='w-5 h-5 text-red-600 border-gray-300 focus:ring-red-500'
                    />
                    <div>
                      <span className='text-gray-800 dark:text-gray-100 font-medium'>• &gt; 30 segundos</span>
                      <div className='text-sm text-gray-600'>Dependencia funcional significativa</div>
                    </div>
                  </label>
                </div>
              </FormItem>
            )} />
          </div>

          {/* Comentarios */}
          <div className='bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg p-4'>
            <h5 className='font-medium text-gray-800 dark:text-gray-100 mb-3'>COMENTARIOS</h5>
            <FormField name='riesgoCaida.comentariosRiesgo' control={form.control} render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    className='min-h-[100px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none' 
                    placeholder='Ingrese observaciones adicionales sobre la evaluación del riesgo de caída...' 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        {/* SECCIÓN: ALCANCE MOTOR */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>X. ALCANCE MOTOR MÁS ALTO</h4>
          </div>
          <FormField name='alcanceMotor' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>Descripción del alcance motor máximo</FormLabel>
              <FormControl>
                <Textarea 
                  className='min-h-[100px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none' 
                  placeholder='Describa el alcance motor más alto alcanzado por el paciente...' 
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )} />
        </div>

        {/* SECCIÓN: ÍNDICE DE BARTHEL */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>XI. DEPENDENCIA FUNCIONAL: ÍNDICE DE BARTHEL (AVD)</h4>
          </div>
          
          <div className='overflow-x-auto'>
            <table className='min-w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border-b border-gray-300 px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100'>Ítem</th>
                  <th className='border-b border-gray-300 px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-100'>Descripción</th>
                  <th className='border-b border-gray-300 px-6 py-4 text-center font-semibold text-gray-800 dark:text-gray-100'>Puntaje</th>
                </tr>
              </thead>
              <tbody>
                {barthelItems.map((item, index) => (
                  <tr key={item.key} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white'}>
                    <td className='border-b border-gray-200 px-6 py-6 align-top w-1/6 font-medium text-gray-800 dark:text-gray-100'>{item.label}</td>
                    <td className='border-b border-gray-200 px-6 py-6 w-3/6'>
                      <ul className='space-y-3'>
                        {item.options.map((opt) => (
                          <li key={opt.label} className='flex items-start gap-3 text-sm text-gray-700'>
                            <span className='text-blue-500 font-bold mt-1'>•</span>
                            <span className='flex-1'>{opt.label}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className='border-b border-gray-200 px-6 py-6 text-center align-top w-1/6'>
                      <div className='flex flex-col items-center gap-3'>
                        {item.options.map((opt) => (
                          <label key={opt.value} className='flex items-center gap-3 cursor-pointer p-2 hover:bg-blue-50 rounded transition-colors'>
                            <input
                              type='radio'
                              name={item.key}
                              value={opt.value}
                              checked={barthel[item.key] === opt.value}
                              onChange={() => setBarthel({ ...barthel, [item.key]: opt.value })}
                              className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500'
                            />
                            <span className={`font-bold text-base px-3 py-1 rounded border transition-colors ${
                              barthel[item.key] === opt.value 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}>
                              {opt.value}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='text-center text-xl font-bold text-blue-800 mb-4'>
              Total: {totalBarthel} puntos
            </div>

            {/* Tabla de grado de dependencia */}
            <div className='flex justify-center'>
              <div className='max-w-md w-full'>
                <table className='w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='border-b border-gray-300 px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-100'>RESULTADO</th>
                      <th className='border-b border-gray-300 px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-100'>GRADO DE DEPENDENCIA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={totalBarthel < 20 ? 'bg-red-100 border-red-300' : ''}>
                      <td className={`border-b border-gray-200 px-4 py-3 text-center font-medium ${totalBarthel < 20 ? 'text-red-800 font-bold' : 'text-gray-700'}`}>&lt;20</td>
                      <td className={`border-b border-gray-200 px-4 py-3 text-center ${totalBarthel < 20 ? 'text-red-800 font-bold' : 'text-gray-700'}`}>Total</td>
                    </tr>
                    <tr className={totalBarthel >= 20 && totalBarthel <= 35 ? 'bg-orange-100 border-orange-300' : ''}>
                      <td className={`border-b border-gray-200 px-4 py-3 text-center font-medium ${totalBarthel >= 20 && totalBarthel <= 35 ? 'text-orange-800 font-bold' : 'text-gray-700'}`}>20-35</td>
                      <td className={`border-b border-gray-200 px-4 py-3 text-center ${totalBarthel >= 20 && totalBarthel <= 35 ? 'text-orange-800 font-bold' : 'text-gray-700'}`}>Grave</td>
                    </tr>
                    <tr className={totalBarthel >= 40 && totalBarthel <= 55 ? 'bg-yellow-100 border-yellow-300' : ''}>
                      <td className={`border-b border-gray-200 px-4 py-3 text-center font-medium ${totalBarthel >= 40 && totalBarthel <= 55 ? 'text-yellow-800 font-bold' : 'text-gray-700'}`}>40-55</td>
                      <td className={`border-b border-gray-200 px-4 py-3 text-center ${totalBarthel >= 40 && totalBarthel <= 55 ? 'text-yellow-800 font-bold' : 'text-gray-700'}`}>Moderado</td>
                    </tr>
                    <tr className={totalBarthel >= 60 && totalBarthel < 100 ? 'bg-blue-100 border-blue-300' : ''}>
                      <td className={`border-b border-gray-200 px-4 py-3 text-center font-medium ${totalBarthel >= 60 && totalBarthel < 100 ? 'text-blue-800 font-bold' : 'text-gray-700'}`}>&gt;=60</td>
                      <td className={`border-b border-gray-200 px-4 py-3 text-center ${totalBarthel >= 60 && totalBarthel < 100 ? 'text-blue-800 font-bold' : 'text-gray-700'}`}>Leve</td>
                    </tr>
                    <tr className={totalBarthel === 100 ? 'bg-green-100 border-green-300' : ''}>
                      <td className={`px-4 py-3 text-center font-medium ${totalBarthel === 100 ? 'text-green-800 font-bold' : 'text-gray-700'}`}>100</td>
                      <td className={`px-4 py-3 text-center ${totalBarthel === 100 ? 'text-green-800 font-bold' : 'text-gray-700'}`}>Independiente</td>
                    </tr>
                  </tbody>
                </table>
                <div className='mt-3 text-center text-sm text-gray-600'>
                  <div><span className='font-semibold'>Máxima puntuación:</span> 100 puntos</div>
                  <div className='text-xs'>(<span className='font-semibold'>90</span> si está en silla de ruedas)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN: V.V COMPONENTE COGNITIVO MINI MENTAL TEST */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>V.V COMPONENTE COGNITIVO MINI MENTAL TEST</h4>
          </div>
          
          <div className='overflow-x-auto'>
            <table className='min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg overflow-hidden'>
              <thead>
                <tr className='bg-gray-50 dark:bg-gray-700'>
                  <th className='border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-100'>ACTIVIDAD</th>
                  <th className='border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-100 w-24'>PUNTOS</th>
                </tr>
              </thead>
              <tbody>
                {/* Orientación */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Orientación:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿El año en que estamos?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.orientacion_ano?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, orientacion_ano: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿La estación del año?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.orientacion_estacion?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, orientacion_estacion: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿La fecha de hoy?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.orientacion_fecha?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, orientacion_fecha: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿El día de la semana?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.orientacion_dia?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, orientacion_dia: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿El mes?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.orientacion_mes?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, orientacion_mes: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Donde estamos */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Donde estamos:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿Región, zona geográfica?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.ubicacion_region?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, ubicacion_region: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿Estado?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.ubicacion_estado?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, ubicacion_estado: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿Ciudad?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.ubicacion_ciudad?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, ubicacion_ciudad: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿Nombre o tipo de local en donde estamos?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.ubicacion_local?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, ubicacion_local: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>¿Piso o planta?</td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.ubicacion_piso?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, ubicacion_piso: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Registro */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Registro:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-3 text-gray-700 dark:text-gray-300'>
                    <div>Nombrar 3 objetos en 3 segundos, con una pausa entre cada uno de ellos.</div>
                    <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Aplicar 1 punto a cada objeto que el paciente consiga nombrar. Repetir los objetos hasta que el paciente nombre los tres.</div>
                    <div className='text-sm font-medium text-blue-600 mt-1'>Puntuar solo la primera tentativa.</div>
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.registro?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, registro: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Atención y Cálculo */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Atención y Cálculo:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-3 text-gray-700 dark:text-gray-300'>
                    <div>Hacer que el paciente reste 7 de 100 y continuar la operación con el valor obtenido (es decir, resta seriada de 7). Aplicar 1 punto a cada respuesta correcta.</div>
                    <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Interrumpir la prueba después de 5 respuestas correctas.</div>
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.atencion_calculo?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, atencion_calculo: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Memoria */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Memoria:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-3 text-gray-700 dark:text-gray-300'>
                    <div>Hacer que el paciente recuerde el nombre de los tres objetos presentados en la fase de registro.</div>
                    <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Aplicar 1 punto a cada objeto recordado.</div>
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.memoria?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, memoria: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Nombrar */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Nombrar:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>
                    <div>Señalar un bolígrafo y un reloj. Aplicar un punto a cada objeto que el paciente consiga nombrar.</div>
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.nombrar?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, nombrar: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Repetición */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Repetición:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>
                    Anotar los términos repetidos por el paciente: no, si y más.
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.repeticion?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, repeticion: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Lectura */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Lectura:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300'>
                    El paciente debe leer y obedecer la orden siguiente ofrecida por escrito: &quot;cierre los ojos&quot;
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.lectura?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, lectura: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Comprensión */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Comprensión:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-3 text-gray-700 dark:text-gray-300'>
                    <div>El paciente debe hacer las 3 fases de una orden:</div>
                    <div className='ml-4 mt-2'>
                      <div>1. Coger un papel con la mano derecha;</div>
                      <div>2. Doblar el papel por la mitad;</div>
                      <div>3. Colocarlo en el suelo.</div>
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Aplicar 1 punto para cada fase realizada.</div>
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.comprension?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, comprension: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Escritura */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    Escritura:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-3 text-gray-700 dark:text-gray-300'>
                    <div>El paciente debe escribir una frase escogida por el mismo. Aplicar 1 punto a las frases que contengan sujeto y objeto, y que tengan sentido.</div>
                    <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Ignorar los errores de ortografía.</div>
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.escritura?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, escritura: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>

                {/* Diseño */}
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100' colSpan={2}>
                    *Diseño:
                  </td>
                </tr>
                <tr>
                  <td className='border border-gray-300 dark:border-gray-600 px-6 py-3 text-gray-700 dark:text-gray-300'>
                    <div>Amplíe el diseño que aparece abajo hasta que tenga 1 a 5 cm y solicite al paciente que lo copie.</div>
                    <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Aplicar 1 punto si todos los lados y ángulos aparecen representados y si los lados de intersección forman un cuadrado.</div>
                  </td>
                  <td className='border border-gray-300 dark:border-gray-600 px-4 py-2 text-center'>
                    <Select value={miniMental.diseno?.toString() || ''} onValueChange={(value) => setMiniMental(prev => ({ ...prev, diseno: parseInt(value) }))}>
                      <SelectTrigger className='w-16 mx-auto border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Resultado total */}
            <div className='mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
              <div className='text-center'>
                <div className='text-lg font-semibold text-blue-800 dark:text-blue-200'>
                  Puntuación Total: <span className='text-2xl'>{totalMiniMental}</span>
                </div>
                
              </div>
              
              {/* Nota importante */}
              <div className='mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
                <div className='flex items-start space-x-2'>
                  <div className='text-amber-600 dark:text-amber-400 font-bold text-sm mt-0.5'>NOTA:</div>
                  <div className='text-sm text-amber-800 dark:text-amber-200'>
                    <p>La puntuación inferior a 26 puntos puede indicar la necesidad de otras pruebas de evaluación.</p>
                    <p className='mt-1'>El diagnóstico cognoscitivo determinado mediante esta prueba varía según el nivel educativo del paciente.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN: COMENTARIOS DEL EXAMINADOR */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>XII. COMENTARIOS DEL EXAMINADOR</h4>
          </div>
          <FormField name='comentariosExaminador' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>Observaciones y comentarios del profesional</FormLabel>
              <FormControl>
                <Textarea 
                  className='min-h-[150px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none' 
                  placeholder='Escriba aquí las observaciones, comentarios y notas adicionales del examinador...' 
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )} />
        </div>

        {/* SECCIÓN: RESUMEN DE RESULTADOS */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>XIII. RESUMEN DE RESULTADOS</h4>
          </div>
          <FormField name='resumenResultados' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>Resumen ejecutivo de la evaluación</FormLabel>
              <FormControl>
                <Textarea 
                  className='min-h-[120px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none' 
                  placeholder='Escriba aquí el resumen de los resultados de la evaluación neurológica...' 
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )} />
          
        </div>

        {/* SECCIÓN: CLASIFICACIÓN CIF */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>XIV. CLASIFICACIÓN CIF (ESTRUCTURAS ANATÓMICAS)</h4>
            {selectedCIFs.length > 0 && (
              <span className='bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium'>
                {selectedCIFs.length} SELECCIONADO{selectedCIFs.length > 1 ? 'S' : ''}
              </span>
            )}
          </div>
          <FormField name='cif' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                Seleccionar estructuras anatómicas según clasificación CIF
              </FormLabel>
              <FormControl>
                <div className='space-y-3'>
                  <AutocompleteCIF
                    onSelect={(cif, desc) => {
                      // Verificar si ya existe
                      const existe = selectedCIFs.find(item => item.codigo === cif);
                      if (!existe) {
                        const newCIFs = [...selectedCIFs, { codigo: cif, descripcion: desc }];
                        setSelectedCIFs(newCIFs);
                        field.onChange(newCIFs.map(item => item.codigo));
                        console.log('CIF seleccionado:', cif, desc);
                      }
                    }}
                    placeholder='Buscar y agregar estructuras anatómicas CIF...'
                    className='w-full'
                  />
                  
                  {/* Lista de CIF seleccionados */}
                  {selectedCIFs.length > 0 && (
                    <div className='space-y-2'>
                      <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Estructuras seleccionadas:
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {selectedCIFs.map((item, index) => (
                          <div 
                            key={`${item.codigo}-${index}`}
                            className='flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-sm'
                          >
                            <div className='flex flex-col'>
                              <span className='font-medium text-blue-800 dark:text-blue-200'>
                                {item.codigo}
                              </span>
                              <span className='text-blue-600 dark:text-blue-400 text-xs'>
                                {item.descripcion}
                              </span>
                            </div>
                            <button
                              type='button'
                              onClick={() => {
                                const newCIFs = selectedCIFs.filter((_, i) => i !== index);
                                setSelectedCIFs(newCIFs);
                                field.onChange(newCIFs.map(item => item.codigo));
                              }}
                              className='text-red-500 hover:text-red-700 font-bold text-lg leading-none'
                              title='Eliminar'
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Mensaje de ayuda */}
                  {selectedCIFs.length === 0 && (
                    <div className='text-xs text-gray-500 dark:text-gray-400 italic'>
                      Puede agregar múltiples estructuras anatómicas. Busque por código (ej: s110) o descripción (ej: cerebro).
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* SECCIÓN: DIAGNÓSTICO FISIOTERAPÉUTICO */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>XV. DIAGNÓSTICO FISIOTERAPÉUTICO</h4>
            <span className='bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium'>EVALUACIÓN</span>
          </div>
          <FormField name='diagnosticoFisioterapeutico' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>Diagnóstico basado en la evaluación fisioterapéutica</FormLabel>
              <FormControl>
                <Textarea 
                  className='min-h-[150px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none' 
                  placeholder='Escriba aquí el diagnóstico fisioterapéutico basado en los hallazgos de la evaluación funcional, alteraciones de la marcha, riesgo de caída y capacidades motoras del paciente...' 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* SECCIÓN: PLAN FISIOTERAPÉUTICO */}
        <div className='space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-3'>
            <h4 className='font-semibold text-xl text-gray-800 dark:text-gray-100'>XVI. PLAN FISIOTERAPÉUTICO</h4>
            <span className='bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium'>TRATAMIENTO</span>
          </div>
          <FormField name='planFisioterapeutico' control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>Plan de tratamiento y objetivos terapéuticos</FormLabel>
              <FormControl>
                <Textarea 
                  className='min-h-[200px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none' 
                  placeholder='Describir el plan de tratamiento fisioterapéutico: objetivos a corto y largo plazo, técnicas y modalidades de tratamiento, frecuencia de sesiones, ejercicios específicos, recomendaciones para el hogar, criterios de evolución y seguimiento...' 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* BOTÓN DE ENVÍO */}
        <div className='flex justify-end pt-6'>
          <Button 
            type='submit' 
            disabled={isPending}
            className='px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isPending ? 'Guardando...' : 'Guardar Evaluación'}
          </Button>
        </div>
      </form>
    </Form>
      </div>
    </div>
  );
}
