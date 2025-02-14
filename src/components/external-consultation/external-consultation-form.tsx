'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

// Esquema de validación con Zod
const formSchema = z.object({
  institucionSistema: z.string().min(1, 'Campo obligatorio'),
  unicodigo: z.string().min(1, 'Campo obligatorio'),
  establecimientoSalud: z.string().min(1, 'Campo obligatorio'),
  numeroHistoriaClinica: z.string().min(1, 'Campo obligatorio'),
  numeroArchivo: z.string().min(1, 'Campo obligatorio'),
  numeroHoja: z.string().min(1, 'Campo obligatorio'),
  primerApellido: z.string().min(1, 'Campo obligatorio'),
  segundoApellido: z.string().optional(),
  primerNombre: z.string().min(1, 'Campo obligatorio'),
  segundoNombre: z.string().optional(),
  sexo: z.string().min(1, 'Campo obligatorio'),
  edad: z.number().min(0, 'La edad debe ser un número positivo'),
  motivoConsultaPrimera: z.string().min(1, 'Campo obligatorio'),
  motivoConsultaSubsecuente: z.string().optional(),
  antecedentesPersonales: z.object({
    cardiopatia: z.boolean(),
    hipertension: z.boolean(),
    ebyec: z.boolean(),
    problemaMetabolico: z.boolean(),
    cancer: z.boolean(),
    tuberculosis: z.boolean(),
    enfMental: z.boolean(),
    enfInfecciosa: z.boolean(),
    malformacion: z.boolean(),
    otro: z.string().optional(),
  }),
  antecedentesFamiliares: z.object({
    cardiopatia: z.boolean(),
    hipertension: z.boolean(),
    ebyec: z.boolean(),
    problemaMetabolico: z.boolean(),
    cancer: z.boolean(),
    tuberculosis: z.boolean(),
    enfMental: z.boolean(),
    enfInfecciosa: z.boolean(),
    malformacion: z.boolean(),
    otro: z.string().optional(),
  }),
  enfermedadActual: z.string().min(1, 'Campo obligatorio'),
  constantesVitales: z.object({
    fecha: z.string().min(1, 'Campo obligatorio'),
    hora: z.string().min(1, 'Campo obligatorio'),
    temperatura: z.number(),
    presionArterial: z.string(),
    frecuenciaCardiaca: z.number(),
    frecuenciaRespiratoria: z.number(),
    peso: z.number(),
    talla: z.number(),
    imc: z.number(),
    perimetroAbdominal: z.number(),
    hemoglobinaCapilar: z.number(),
    glucosaCapilar: z.number(),
    pulsioximetria: z.number(),
  }),
  revisionOrganosSistemas: z.object({
    pielAnexos: z.string().optional(),
    organosSentidos: z.string().optional(),
    respiratorio: z.string().optional(),
    cardioVascular: z.string().optional(),
    digestivo: z.string().optional(),
    genitoUrinario: z.string().optional(),
    musculoEsqueletico: z.string().optional(),
    endocrino: z.string().optional(),
    hemolinfatico: z.string().optional(),
    nervioso: z.string().optional(),
  }),
  examenFisico: z.object({
    pielFaneras: z.string().optional(),
    cabeza: z.string().optional(),
    ojos: z.string().optional(),
    oidos: z.string().optional(),
    nariz: z.string().optional(),
    boca: z.string().optional(),
    cuello: z.string().optional(),
    torax: z.string().optional(),
    abdomen: z.string().optional(),
    genital: z.string().optional(),
    miembrosSuperiores: z.string().optional(),
    miembrosInferiores: z.string().optional(),
    columnaVertebral: z.string().optional(),
    inglePerine: z.string().optional(),
    axilasMamas: z.string().optional(),
  }),
  diagnostico: z.string().min(1, 'Campo obligatorio'),
  planTratamiento: z.string().min(1, 'Campo obligatorio'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExternalConsultationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>
        Consulta Externa - Anamnesis y Examen Físico
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>
            A. Datos del Establecimiento y Usuario/Paciente
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institución del Sistema</TableHead>
                <TableHead>Unicódigo</TableHead>
                <TableHead>Establecimiento de Salud</TableHead>
                <TableHead>Número de Historia Clínica Única</TableHead>
                <TableHead>Número de Archivo</TableHead>
                <TableHead>No. Hoja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Input {...register('institucionSistema')} />
                  {errors.institucionSistema && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {errors.institucionSistema.message}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Input {...register('unicodigo')} />
                  {errors.unicodigo && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {errors.unicodigo.message}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Input {...register('establecimientoSalud')} />
                  {errors.establecimientoSalud && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {errors.establecimientoSalud.message}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Input {...register('numeroHistoriaClinica')} />
                  {errors.numeroHistoriaClinica && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {errors.numeroHistoriaClinica.message}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Input {...register('numeroArchivo')} />
                  {errors.numeroArchivo && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {errors.numeroArchivo.message}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Input {...register('numeroHoja')} />
                  {errors.numeroHoja && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {errors.numeroHoja.message}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className='mt-4 grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Primer Apellido</Label>
              <Input {...register('primerApellido')} />
              {errors.primerApellido && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.primerApellido.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Segundo Apellido</Label>
              <Input {...register('segundoApellido')} />
            </div>
            <div className='space-y-2'>
              <Label>Primer Nombre</Label>
              <Input {...register('primerNombre')} />
              {errors.primerNombre && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.primerNombre.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Segundo Nombre</Label>
              <Input {...register('segundoNombre')} />
            </div>
            <div className='space-y-2'>
              <Label>Sexo</Label>
              <Input {...register('sexo')} />
              {errors.sexo && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.sexo.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Edad (Años)</Label>
              <Input
                type='number'
                {...register('edad', { valueAsNumber: true })}
              />
              {errors.edad && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.edad.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Sección B: Motivo de Consulta */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>B. Motivo de Consulta</h3>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Primera</Label>
              <Input {...register('motivoConsultaPrimera')} />
              {errors.motivoConsultaPrimera && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.motivoConsultaPrimera.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Subsecuente</Label>
              <Input {...register('motivoConsultaSubsecuente')} />
            </div>
          </div>
        </section>

        {/* Sección C: Antecedentes Patológicos Personales */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>
            C. Antecedentes Patológicos Personales
          </h3>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.cardiopatia')} />
              <Label htmlFor='cardiopatia'>Cardiopatía</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.hipertension')} />
              <Label htmlFor='hipertension'>Hipertensión</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.ebyec')} />
              <Label htmlFor='ebyec'>E-BYE C</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                {...register('antecedentesPersonales.problemaMetabolico')}
              />
              <Label htmlFor='problema-metabolico'>Problema Metabólico</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.cancer')} />
              <Label htmlFor='cancer'>Cáncer</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.tuberculosis')} />
              <Label htmlFor='tuberculosis'>Tuberculosis</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.enfMental')} />
              <Label htmlFor='enf-mental'>Enf. Mental</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.enfInfecciosa')} />
              <Label htmlFor='enf-infecciosa'>Enf. Infecciosa</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.malformacion')} />
              <Label htmlFor='malformacion'>Malformación</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesPersonales.otro')} />
              <Label htmlFor='otro'>Otro</Label>
              <Input
                type='text'
                className='w-48'
                {...register('antecedentesPersonales.otro')}
              />
            </div>
          </div>
        </section>

        {/* Sección D: Antecedentes Patológicos Familiares */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>
            D. Antecedentes Patológicos Familiares
          </h3>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.cardiopatia')} />
              <Label htmlFor='fam-cardiopatia'>Cardiopatía</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.hipertension')} />
              <Label htmlFor='fam-hipertension'>Hipertensión</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.ebyec')} />
              <Label htmlFor='fam-ebyec'>E-BYE C</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                {...register('antecedentesFamiliares.problemaMetabolico')}
              />
              <Label htmlFor='fam-problema-metabolico'>
                Problema Metabólico
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.cancer')} />
              <Label htmlFor='fam-cancer'>Cáncer</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.tuberculosis')} />
              <Label htmlFor='fam-tuberculosis'>Tuberculosis</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.enfMental')} />
              <Label htmlFor='fam-enf-mental'>Enf. Mental</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.enfInfecciosa')} />
              <Label htmlFor='fam-enf-infecciosa'>Enf. Infecciosa</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.malformacion')} />
              <Label htmlFor='fam-malformacion'>Malformación</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox {...register('antecedentesFamiliares.otro')} />
              <Label htmlFor='fam-otro'>Otro</Label>
              <Input
                type='text'
                className='w-48'
                {...register('antecedentesFamiliares.otro')}
              />
            </div>
          </div>
        </section>

        {/* Sección E: Enfermedad o Problema Actual */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>
            E. Enfermedad o Problema Actual
          </h3>
          <div>
            <Label>Descripción</Label>
            <Input {...register('enfermedadActual')} />
            {errors.enfermedadActual && (
              <p className='text-sm text-red-600 dark:text-red-400'>
                {errors.enfermedadActual.message}
              </p>
            )}
          </div>
        </section>

        {/* Sección F: Constantes Vitales y Antropometría */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>
            F. Constantes Vitales y Antropometría
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>Fecha</Label>
              <Input type='date' {...register('constantesVitales.fecha')} />
              {errors.constantesVitales?.fecha && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.fecha.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Hora</Label>
              <Input type='time' {...register('constantesVitales.hora')} />
              {errors.constantesVitales?.hora && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.hora.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Temperatura (°C)</Label>
              <Input
                type='number'
                {...register('constantesVitales.temperatura', {
                  valueAsNumber: true,
                })}
              />
              {errors.constantesVitales?.temperatura && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.temperatura.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Presión Arterial (mmHg)</Label>
              <Input {...register('constantesVitales.presionArterial')} />
              {errors.constantesVitales?.presionArterial && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.presionArterial.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Frecuencia Cardíaca (/min)</Label>
              <Input
                type='number'
                {...register('constantesVitales.frecuenciaCardiaca', {
                  valueAsNumber: true,
                })}
              />
              {errors.constantesVitales?.frecuenciaCardiaca && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.frecuenciaCardiaca.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Frecuencia Respiratoria (/min)</Label>
              <Input
                type='number'
                {...register('constantesVitales.frecuenciaRespiratoria', {
                  valueAsNumber: true,
                })}
              />
              {errors.constantesVitales?.frecuenciaRespiratoria && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.frecuenciaRespiratoria.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Peso (kg)</Label>
              <Input
                type='number'
                {...register('constantesVitales.peso', { valueAsNumber: true })}
              />
              {errors.constantesVitales?.peso && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.peso.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Talla (cm)</Label>
              <Input
                type='number'
                {...register('constantesVitales.talla', {
                  valueAsNumber: true,
                })}
              />
              {errors.constantesVitales?.talla && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.talla.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>IMC (kg/m²)</Label>
              <Input
                type='number'
                {...register('constantesVitales.imc', { valueAsNumber: true })}
              />
              {errors.constantesVitales?.imc && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.imc.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Perímetro Abdominal (cm)</Label>
              <Input
                type='number'
                {...register('constantesVitales.perimetroAbdominal', {
                  valueAsNumber: true,
                })}
              />
              {errors.constantesVitales?.perimetroAbdominal && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.perimetroAbdominal.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Hemoglobina Capilar (g/dl)</Label>
              <Input
                type='number'
                {...register('constantesVitales.hemoglobinaCapilar', {
                  valueAsNumber: true,
                })}
              />
              {errors.constantesVitales?.hemoglobinaCapilar && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.hemoglobinaCapilar.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Glucosa Capilar (mg/dl)</Label>
              <Input
                type='number'
                {...register('constantesVitales.glucosaCapilar', {
                  valueAsNumber: true,
                })}
              />
              {errors.constantesVitales?.glucosaCapilar && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.glucosaCapilar.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Pulsoximetría (%)</Label>
              <Input
                type='number'
                {...register('constantesVitales.pulsioximetria', {
                  valueAsNumber: true,
                })}
              />
              {errors.constantesVitales?.pulsioximetria && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {errors.constantesVitales.pulsioximetria.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Sección G: Revisión de Órganos y Sistemas */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>
            G. Revisión de Órganos y Sistemas
          </h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Piel y Anexos</Label>
              <Input {...register('revisionOrganosSistemas.pielAnexos')} />
            </div>
            <div className='space-y-2'>
              <Label>Órganos de los Sentidos</Label>
              <Input {...register('revisionOrganosSistemas.organosSentidos')} />
            </div>
            <div className='space-y-2'>
              <Label>Respiratorio</Label>
              <Input {...register('revisionOrganosSistemas.respiratorio')} />
            </div>
            <div className='space-y-2'>
              <Label>Cardio - Vascular</Label>
              <Input {...register('revisionOrganosSistemas.cardioVascular')} />
            </div>
            <div className='space-y-2'>
              <Label>Digestivo</Label>
              <Input {...register('revisionOrganosSistemas.digestivo')} />
            </div>
            <div className='space-y-2'>
              <Label>Genito - Urinario</Label>
              <Input {...register('revisionOrganosSistemas.genitoUrinario')} />
            </div>
            <div className='space-y-2'>
              <Label>Músculo - Esquelético</Label>
              <Input
                {...register('revisionOrganosSistemas.musculoEsqueletico')}
              />
            </div>
            <div className='space-y-2'>
              <Label>Endocrino</Label>
              <Input {...register('revisionOrganosSistemas.endocrino')} />
            </div>
            <div className='space-y-2'>
              <Label>Hemo - Linfático</Label>
              <Input {...register('revisionOrganosSistemas.hemolinfatico')} />
            </div>
            <div className='space-y-2'>
              <Label>Nervioso</Label>
              <Input {...register('revisionOrganosSistemas.nervioso')} />
            </div>
          </div>
        </section>

        {/* Sección H: Examen Físico */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>H. Examen Físico</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Piel y Faneras</Label>
              <Input {...register('examenFisico.pielFaneras')} />
            </div>
            <div className='space-y-2'>
              <Label>Cabeza</Label>
              <Input {...register('examenFisico.cabeza')} />
            </div>
            <div className='space-y-2'>
              <Label>Ojos</Label>
              <Input {...register('examenFisico.ojos')} />
            </div>
            <div className='space-y-2'>
              <Label>Oídos</Label>
              <Input {...register('examenFisico.oidos')} />
            </div>
            <div className='space-y-2'>
              <Label>Nariz</Label>
              <Input {...register('examenFisico.nariz')} />
            </div>
            <div className='space-y-2'>
              <Label>Boca</Label>
              <Input {...register('examenFisico.boca')} />
            </div>
            <div className='space-y-2'>
              <Label>Cuello</Label>
              <Input {...register('examenFisico.cuello')} />
            </div>
            <div className='space-y-2'>
              <Label>Tórax</Label>
              <Input {...register('examenFisico.torax')} />
            </div>
            <div className='space-y-2'>
              <Label>Abdomen</Label>
              <Input {...register('examenFisico.abdomen')} />
            </div>
            <div className='space-y-2'>
              <Label>Genital</Label>
              <Input {...register('examenFisico.genital')} />
            </div>
            <div className='space-y-2'>
              <Label>Miembros Superiores</Label>
              <Input {...register('examenFisico.miembrosSuperiores')} />
            </div>
            <div className='space-y-2'>
              <Label>Miembros Inferiores</Label>
              <Input {...register('examenFisico.miembrosInferiores')} />
            </div>
            <div className='space-y-2'>
              <Label>Columna Vertebral</Label>
              <Input {...register('examenFisico.columnaVertebral')} />
            </div>
            <div className='space-y-2'>
              <Label>Ingle - Periné</Label>
              <Input {...register('examenFisico.inglePerine')} />
            </div>
            <div className='space-y-2'>
              <Label>Axilas - Mamas</Label>
              <Input {...register('examenFisico.axilasMamas')} />
            </div>
          </div>
        </section>

        {/* Sección I: Diagnóstico */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>I. Diagnóstico</h3>
          <div className='space-y-2'>
            <Label>Diagnóstico</Label>
            <Input {...register('diagnostico')} />
            {errors.diagnostico && (
              <p className='text-sm text-red-600 dark:text-red-400'>
                {errors.diagnostico.message}
              </p>
            )}
          </div>
        </section>

        {/* Sección J: Plan de Tratamiento */}
        <section className='mb-4'>
          <h3 className='mb-4 text-xl font-semibold'>J. Plan de Tratamiento</h3>
          <div className='space-y-2'>
            <Label>Plan de Tratamiento</Label>
            <Input {...register('planTratamiento')} />
            {errors.planTratamiento && (
              <p className='text-sm text-red-600 dark:text-red-400'>
                {errors.planTratamiento.message}
              </p>
            )}
          </div>
        </section>

        {/* Botón de envío */}
        <div className='mt-6'>
          <Button
            type='submit'
            className='bg-[#164284] text-white hover:bg-[#0d2f4d] dark:bg-[#0d2f4d] dark:hover:bg-[#164284]'
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
