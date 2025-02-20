/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLaboratoryRequest } from '@/services/labRequestService';
import { useToast } from '@/hooks/use-toast';
import { getSession, useSession } from 'next-auth/react';
import { CreateLaboratoryRequestDTO } from '@/types/labrequest/create-laboratory-request';
import { useEffect } from 'react';

const labFormSchema = z.object({
  numero_de_archivo: z.string().min(1, 'Campo obligatorio'),
  diagnostico_descripcion1: z.string().min(1, 'Campo obligatorio'),
  diagnostico_cie1: z.string().min(1, 'Campo obligatorio'),
  diagnostico_descripcion2: z.string().min(1, 'Campo obligatorio'),
  diagnostico_cie2: z.string().min(1, 'Campo obligatorio'),
  prioridad: z.enum(['URGENTE', 'RUTINA']),
  hematologia_examenes: z.array(z.string()).optional().default([]),
  coagulacion_examenes: z.array(z.string()).optional().default([]),
  quimica_sanguinea_examenes: z.array(z.string()).optional().default([]),
  orina_examenes: z.array(z.string()).optional().default([]),
  heces_examenes: z.array(z.string()).optional().default([]),
  hormonas_examenes: z.array(z.string()).optional().default([]),
  serologia_examenes: z.array(z.string()).optional().default([]),
  userId: z.string().uuid(),
  patientId: z.string().uuid(),
  microbiologia: z
    .object({
      muestra: z.string().min(1, 'Campo obligatorio'),
      sitio_anatomico: z.string().min(1, 'Campo obligatorio'),
      cultivo_y_antibiograma: z.boolean().optional(),
      cristalografia: z.boolean().optional(),
      gram: z.boolean().optional(),
      fresco: z.boolean().optional(),
      estudio_micologico_koh: z.string(),
      cultivo_micotico: z.string(),
      investigacion_paragonimus_spp: z.string(),
      investigacion_histoplasma_spp: z.string(),
      coloracion_zhiel_nielsen: z.string(),
    })
    .optional(),
});

type LabFormValues = z.infer<typeof labFormSchema>;

export default function LaboratoryRequestForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<LabFormValues>({
    resolver: zodResolver(labFormSchema),
    mode: 'onChange',
  });

  /** 🔹 Fetch session data (userId y patientId) */
  useEffect(() => {
    const fetchSessionData = async () => {
      const sessionData = await getSession();
      console.log('🔑 Sesión obtenida:', sessionData);

      if (sessionData?.user?.access_token) {
        // Extraer el ID del usuario del token JWT
        const token = sessionData.user.access_token;
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.id; // Este es el UUID que necesitamos

        if (userId) {
          setValue('userId', userId);
          console.log(`✅ userId asignado correctamente: ${userId}`);
        } else {
          console.warn('⚠️ No se encontró el UUID en el token.');
        }

        // Accedemos al patientId
        const patientId = sessionData.user.team?.patient?.id;
        if (patientId) {
          setValue('patientId', patientId);
          console.log(`✅ patientId asignado correctamente: ${patientId}`);
        } else {
          console.warn('⚠️ No se encontró `patientId` en la sesión.');
        }
      } else {
        console.error('🚨 No se encontró el token de acceso en la sesión.');
      }
    };

    fetchSessionData();
  }, [setValue]);

  const mutation = useMutation({
    mutationFn: async (data: CreateLaboratoryRequestDTO) => {
      console.log('🛠️ `mutationFn` ejecutándose con datos:', data);

      const session = await getSession();
      console.log('🔑 Sesión obtenida:', session);

      const token = session?.user.access_token;
      if (!token) {
        console.error(
          '🚨 No se encontró el token. No se puede hacer la solicitud.'
        );
        return;
      }

      try {
        const response = await createLaboratoryRequest(data, token);
        console.log('📤 Respuesta del servidor:', response);
        return response;
      } catch (error) {
        console.error('❌ Error al enviar la solicitud:', error);
        throw error;
      }
    },
    onSuccess: () => console.log('✅ Mutación ejecutada con éxito'),
    onError: (error) =>
      console.error('❌ Error en `mutation.mutate()`:', error),
  });

  const onSubmit = async (data: LabFormValues) => {
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

      const patientId = sessionData.user.team?.patient?.id;
      if (!patientId) {
        toast({
          title: 'Error',
          description: 'No se pudo obtener el ID del paciente',
          variant: 'destructive',
        });
        return;
      }

      // Extraer el ID del usuario del token JWT
      const token = sessionData.user.access_token;
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      console.log('User ID from token:', userId);

      const formattedData = {
        ...data,
        userId: userId,
        patientId: patientId, // Usar el patientId validado
      };

      console.log('Datos a enviar:', formattedData);

      const response = await createLaboratoryRequest(formattedData, token);
      toast({
        title: 'Éxito',
        description: 'Pedido de laboratorio creado correctamente',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al crear el pedido de laboratorio';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  /** 🔹 Muestra errores en la consola para debugging */
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error('🚨 Errores en el formulario:', errors);
    }
  }, [errors]);

  return (
    <div className='rounded-lg bg-zinc-50 p-6 shadow dark:bg-gray-800'>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log('🟢 Formulario enviado');

          handleSubmit((data) => {
            console.log(
              '🔍 `handleSubmit` se ejecutó correctamente con los datos:',
              data
            );
            if (Object.keys(errors).length > 0) {
              toast({
                title: 'Errores en el formulario',
                description: 'Por favor revisa los campos en rojo.',
                variant: 'destructive',
              });
            } else {
              onSubmit(data);
            }
          })();
        }}
        className='space-y-4'
      >
        <h2 className='text-2xl font-bold'>
          Formulario de Solicitud de Laboratorio
        </h2>

        {/* Sección A: Datos del Paciente */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>A. Datos del Paciente</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Número de Archivo</Label>
              <Input {...register('numero_de_archivo')} />
            </div>
            <div className='space-y-2'>
              <Label>Diagnóstico 1</Label>
              <Input {...register('diagnostico_descripcion1')} />
            </div>
            <div className='space-y-2'>
              <Label>CIE 1</Label>
              <Input {...register('diagnostico_cie1')} />
            </div>
            <div className='space-y-2'>
              <Label>Diagnóstico 2</Label>
              <Input {...register('diagnostico_descripcion2')} />
            </div>
            <div className='space-y-2'>
              <Label>CIE 2</Label>
              <Input {...register('diagnostico_cie2')} />
            </div>
          </div>
        </section>

        {/* Sección B: Servicio y Prioridad */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>
            B. Servicio y Prioridad
          </h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Prioridad</Label>
              <select
                {...register('prioridad')}
                className='w-full rounded border bg-input p-2'
              >
                <option value='URGENTE'>Urgente</option>
                <option value='RUTINA'>Rutina</option>
              </select>
            </div>
          </div>
        </section>

        {/* Sección C: Exámenes de Laboratorio */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>
            C. Exámenes de Laboratorio
          </h3>

          {/* Hematología */}
          <div className='mb-4'>
            <h4 className='mb-2 font-semibold'>Hematología</h4>
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-input p-4'>
              {[
                'Biometría Hemática',
                'Hematocrito (HCTO)',
                'Hemoglobina (HB)',
                'Plaquetas',
                'Reticulocitos',
                'Velocidad de Eritrosedimentación',
                'Hierro Sérico',
                'Fijación Hierro',
                'Porcentaje Saturación Transferrina',
                'Transferrina',
                'Ferritina',
                'Fragilidad Osmótica Eritrocitaria',
                'Metabisulfito',
                'Hematozoario',
                'Investigación de Leishmania',
                'Eosinófilo en Moco Nasal',
                'Frotis Sangre Periférica',
                'Ácido Fólico',
                'Vitamina B12',
              ].map((examen) => (
                <label key={examen} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    value={examen}
                    checked={
                      (Array.isArray(getValues('hematologia_examenes')) &&
                        getValues('hematologia_examenes').includes(examen)) ||
                      false
                    }
                    onChange={(e) => {
                      const currentValues = Array.isArray(
                        getValues('hematologia_examenes')
                      )
                        ? getValues('hematologia_examenes')
                        : [];
                      setValue(
                        'hematologia_examenes',
                        e.target.checked
                          ? [...currentValues, examen]
                          : currentValues.filter((v) => v !== examen),
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <span>{examen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Coagulación y Hemostasia */}
          <div className='mb-4'>
            <h4 className='mb-2 font-semibold'>Coagulación y Hemostasia</h4>
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-input p-4'>
              {[
                'Tiempo de Protrombina (TP)',
                'Tiempo de Tromboplastina Parcial (TTP)',
                'Tiempo de Trombina (TT)',
                'INR',
                'Factor Coagulación VII',
                'Factor Coagulación IX',
                'Factor Von Willebrand',
                'Fibrinógeno',
                'Dímero-D',
                'Identificación de Inhibidores',
              ].map((examen) => (
                <label key={examen} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    value={examen}
                    checked={
                      (Array.isArray(getValues('coagulacion_examenes')) &&
                        getValues('coagulacion_examenes').includes(examen)) ||
                      false
                    }
                    onChange={(e) => {
                      const currentValues = Array.isArray(
                        getValues('coagulacion_examenes')
                      )
                        ? getValues('coagulacion_examenes')
                        : [];
                      setValue(
                        'coagulacion_examenes',
                        e.target.checked
                          ? [...currentValues, examen]
                          : currentValues.filter((v) => v !== examen),
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <span>{examen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Química Sanguínea */}
          <div className='mb-4'>
            <h4 className='mb-2 font-semibold'>Química Sanguínea</h4>
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-input p-4'>
              {[
                'Glucosa Basal',
                'Glucosa Post Prandial 2 horas',
                'Glucosa al Azar',
                'Sobrecarga Glucosa 75g',
                'Test de Sullivan (Glucosa 50g)',
                'Urea',
                'Creatinina',
                'Ácido Úrico',
                'Fosfatasa Alcalina',
                'Deshidrogenasa Láctica (LDH)',
                'Aspartato Aminotransferasa (AST/TGO)',
                'Alanina Aminotransferasa (ALT/TGP)',
                'Gamma-Glutaril Transferasa (GGT)',
                'Amilasa',
                'Lipasa',
                'Bilirrubina Total',
                'Bilirrubina Directa',
                'Bilirrubina Indirecta',
                'Colesterol Total',
                'HDL',
                'LDL',
                'VLDL',
                'Triglicéridos',
                'Albúmina',
                'Proteínas Totales',
                'Hemoglobina Glicosilada (HBA1C)',
                'CPK Total',
                'Fructosamina',
                'PCR Cuantitativo',
              ].map((examen) => (
                <label key={examen} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    value={examen}
                    checked={(Array.isArray(
                      getValues('quimica_sanguinea_examenes')
                    )
                      ? getValues('quimica_sanguinea_examenes')
                      : []
                    ).includes(examen)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(
                        getValues('quimica_sanguinea_examenes')
                      )
                        ? getValues('quimica_sanguinea_examenes')
                        : [];
                      setValue(
                        'quimica_sanguinea_examenes',
                        e.target.checked
                          ? [...currentValues, examen]
                          : currentValues.filter((v) => v !== examen),
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <span>{examen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Orina */}
          <div className='mb-4'>
            <h4 className='mb-2 font-semibold'>Orina</h4>
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-input p-4'>
              {[
                'Elemental y Microscópico (EMO)',
                'Gram Gota Fresca',
                'Osmolaridad Urinaria',
                'Sodio en Orina Parcial',
                'Potasio en Orina Parcial',
                'Cloro en Orina Parcial',
                'Calcio Urinario',
                'Fósforo en Orina Parcial',
                'Magnesio en Orina Parcial',
                'Glucosa en Orina Parcial',
                'Urea en Orina Parcial',
                'Creatinina en Orina Parcial',
                'Nitrógeno Uréico en Orina Parcial',
                'Ácido Úrico en Orina Parcial',
                'Proteínas en Orina Parcial',
                'Fósforo en Orina 24 Horas',
                'Potasio en Orina 24 Horas',
                'Depuración Creatinina Orina 24 Horas',
                'Ácido Úrico en Orina 24 Horas',
                'Calcio en Orina 24 Horas',
                'Amilasa en Orina 24 Horas',
                'Azúcares Reductores',
                'Drogas de Abuso en Orina',
                'Albuminuria',
              ].map((examen) => (
                <label key={examen} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    value={examen}
                    checked={(Array.isArray(getValues('orina_examenes'))
                      ? getValues('orina_examenes')
                      : []
                    ).includes(examen)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(
                        getValues('orina_examenes')
                      )
                        ? getValues('orina_examenes')
                        : [];
                      setValue(
                        'orina_examenes',
                        e.target.checked
                          ? [...currentValues, examen]
                          : currentValues.filter((v) => v !== examen),
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <span>{examen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Hormonal */}
          <div className='mb-4'>
            <h4 className='mb-2 font-semibold'>Hormonal</h4>
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-input p-4'>
              {[
                'T3',
                'FT3',
                'T4',
                'FT4',
                'TSH',
                'PTH',
                'FSH',
                'Androstenediona',
                'Factor de Crecimiento Insulinoide Tipo 1 (IGF-1)',
                'Factor de Unión del IGF-1 (IGFBP3)',
                'B-HCG Cualitativa',
                'B-HCG Cuantitativa',
                'Hormona de Crecimiento',
                'Progesterona',
                'Insulina',
                'ACTH',
                'Prolactina',
                'Vitamina D',
                'Estradiol (E2)',
                'LH',
                'Cortisol',
                'Testosterona Total',
                'Testosterona Libre',
                'DHEA-S',
              ].map((examen) => (
                <label key={examen} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    value={examen}
                    checked={(Array.isArray(getValues('hormonas_examenes'))
                      ? getValues('hormonas_examenes')
                      : []
                    ).includes(examen)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(
                        getValues('hormonas_examenes')
                      )
                        ? getValues('hormonas_examenes')
                        : [];
                      setValue(
                        'hormonas_examenes',
                        e.target.checked
                          ? [...currentValues, examen]
                          : currentValues.filter((v) => v !== examen),
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <span>{examen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Heces */}
          <div className='mb-4'>
            <h4 className='mb-2 font-semibold'>Heces</h4>
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-input p-4'>
              {[
                'Parásitos en Heces',
                'Sangre Oculta en Heces',
                'Leucocitos en Heces',
                'Grasas en Heces',
                'Azúcares Reductores en Heces',
                'pH en Heces',
                'Coloración de Lugol',
                'Moco en Heces',
                'Bacterias en Heces',
              ].map((examen) => (
                <label key={examen} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    value={examen}
                    checked={(Array.isArray(getValues('heces_examenes'))
                      ? getValues('heces_examenes')
                      : []
                    ).includes(examen)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(
                        getValues('heces_examenes')
                      )
                        ? getValues('heces_examenes')
                        : [];
                      setValue(
                        'heces_examenes',
                        e.target.checked
                          ? [...currentValues, examen]
                          : currentValues.filter((v) => v !== examen),
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <span>{examen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Serología */}
          <div>
            <h4 className='mb-2 font-semibold'>Serología</h4>
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-input p-4'>
              {[
                'Aglutinación Febriles',
                'ASTO',
                'FR-Latex',
                'Dengue (PCR)',
                'Chlamydia (PCR)',
                'Pepsinógeno',
                'VDRL',
                'PCR Semicuantitativa',
                'Malaria (PCR)',
                'Sífilis (PCR)',
                'Helicobacter Pylori',
              ].map((examen) => (
                <label key={examen} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    value={examen}
                    checked={(Array.isArray(getValues('serologia_examenes'))
                      ? getValues('serologia_examenes')
                      : []
                    ).includes(examen)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(
                        getValues('serologia_examenes')
                      )
                        ? getValues('serologia_examenes')
                        : [];
                      setValue(
                        'serologia_examenes',
                        e.target.checked
                          ? [...currentValues, examen]
                          : currentValues.filter((v) => v !== examen),
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <span>{examen}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Sección D: Microbiología */}
        <section>
          <h3 className='mb-4 text-xl font-semibold'>D. Microbiología</h3>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Muestra</Label>
              <Input {...register('microbiologia.muestra')} />
            </div>
            <div className='space-y-2'>
              <Label>Sitio Anatómico</Label>
              <Input {...register('microbiologia.sitio_anatomico')} />
            </div>
          </div>

          <div className='mt-4 flex items-center gap-8'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                {...register('microbiologia.cultivo_y_antibiograma', {
                  setValueAs: (v) => v === true,
                })}
              />
              <Label>Cultivo y Antibiograma</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                {...register('microbiologia.cristalografia', {
                  setValueAs: (v) => v === true,
                })}
              />
              <Label>Cristalografía</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                {...register('microbiologia.gram', {
                  setValueAs: (v) => v === true,
                })}
              />
              <Label>Gram</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                {...register('microbiologia.fresco', {
                  setValueAs: (v) => v === true,
                })}
              />
              <Label>Fresco</Label>
            </div>
          </div>

          <div className='mt-4 grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Estudio Micologico KOH</Label>
              <Input {...register('microbiologia.estudio_micologico_koh')} />
            </div>
            <div className='space-y-2'>
              <Label>Cultivo Micótico</Label>
              <Input {...register('microbiologia.cultivo_micotico')} />
            </div>
            <div className='space-y-2'>
              <Label>Investigación Paragonimus spp</Label>
              <Input
                {...register('microbiologia.investigacion_paragonimus_spp')}
              />
            </div>
            <div className='space-y-2'>
              <Label>Investigación Histoplasma spp</Label>
              <Input
                {...register('microbiologia.investigacion_histoplasma_spp')}
              />
            </div>
            <div className='space-y-2'>
              <Label>Coloración Ziehl-Neelsen</Label>
              <Input {...register('microbiologia.coloracion_zhiel_nielsen')} />
            </div>
          </div>
        </section>

        <Button type='submit' className='mt-4 bg-primary text-white'>
          Enviar Solicitud
        </Button>
      </form>
    </div>
  );
}
