'use client';

import { useState } from 'react';
import { useMedicalValidation } from '@/hooks/use-medical-validation';
import MedicalCoherenceChecker from './medical-coherence-checker';
import MedicalValidationSummary from './medical-validation-summary';
import MedicalProtocolChecker from './medical-protocol-checker';
import MedicalFieldValidator from './medical-field-validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MedicalValidationDemo() {
  const [patientAge] = useState(45);
  const patientGender = 'male';
  
  const {
    form,
    validationState,
    validateFormCompletely,
    getValidationProgress,
    getClinicalAlerts,
    isFormValid,
  } = useMedicalValidation({
    config: {
      enableRealTimeValidation: true,
      enableCoherenceChecking: true,
      enableProtocolValidation: true,
      enableClinicalAlerts: true,
    },
    patientAge,
    onValidationChange: (state) => {
      console.log('Estado de validación actualizado:', state);
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const formProgress = getValidationProgress();
  const clinicalAlerts = getClinicalAlerts();
  const formData = watch();

  const onSubmit = (data: unknown) => {
    console.log('Datos del formulario:', data);
    const isCompletelyValid = validateFormCompletely();
    if (isCompletelyValid) {
      alert('✅ Formulario médico válido y completo!');
    } else {
      alert('❌ Por favor, corrija los errores antes de continuar');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Validación Médica
        </h1>
        <p className="text-gray-600">
          Demostración del sistema completo de validación y verificación para formularios médicos
        </p>
      </div>

      {/* Resumen de Validación */}
      <MedicalValidationSummary
        validationState={validationState}
        formProgress={formProgress}
        patientInfo={{
          name: 'Juan Pérez Demo',
          age: patientAge,
          gender: patientGender,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formulario de Consulta Médica</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Motivo de Consulta */}
                <div>
                  <Label htmlFor="consultationReason">Motivo de Consulta</Label>
                  <Textarea
                    id="consultationReason"
                    {...register('consultationReason')}
                    placeholder="Describa el motivo principal de la consulta..."
                    className="mt-1"
                  />
                  {errors.consultationReason && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.consultationReason.message}
                    </p>
                  )}
                  <MedicalFieldValidator
                    fieldName="consultationReason"
                    value={watch('consultationReason')}
                    isRequired={true}
                    patientAge={patientAge}
                    patientGender={patientGender}
                  />
                </div>

                {/* Enfermedad Actual */}
                <div>
                  <Label htmlFor="currentIllness">Enfermedad Actual</Label>
                  <Textarea
                    id="currentIllness"
                    {...register('currentIllness')}
                    placeholder="Describa la evolución y características de la enfermedad actual..."
                    className="mt-1"
                  />
                  {errors.currentIllness && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currentIllness.message}
                    </p>
                  )}
                  <MedicalFieldValidator
                    fieldName="currentIllness"
                    value={watch('currentIllness')}
                    isRequired={true}
                    patientAge={patientAge}
                    patientGender={patientGender}
                  />
                </div>

                {/* Signos Vitales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperatura (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      {...register('vitalSigns.temperature', { valueAsNumber: true })}
                      placeholder="36.5"
                    />
                    <MedicalFieldValidator
                      fieldName="vitalSigns.temperature"
                      value={watch('vitalSigns.temperature')}
                      isRequired={true}
                      patientAge={patientAge}
                      patientGender={patientGender}
                    />
                  </div>

                  <div>
                    <Label htmlFor="heartRate">FC (lpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      {...register('vitalSigns.heartRate', { valueAsNumber: true })}
                      placeholder="80"
                    />
                    <MedicalFieldValidator
                      fieldName="vitalSigns.heartRate"
                      value={watch('vitalSigns.heartRate')}
                      isRequired={true}
                      patientAge={patientAge}
                      patientGender={patientGender}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bloodPressure">Presión Arterial</Label>
                    <Input
                      id="bloodPressure"
                      {...register('vitalSigns.bloodPressure')}
                      placeholder="120/80"
                    />
                    <MedicalFieldValidator
                      fieldName="vitalSigns.bloodPressure"
                      value={watch('vitalSigns.bloodPressure')}
                      isRequired={true}
                      patientAge={patientAge}
                      patientGender={patientGender}
                    />
                  </div>

                  <div>
                    <Label htmlFor="oxygenSaturation">SpO2 (%)</Label>
                    <Input
                      id="oxygenSaturation"
                      type="number"
                      {...register('vitalSigns.oxygenSaturation', { valueAsNumber: true })}
                      placeholder="98"
                    />
                    <MedicalFieldValidator
                      fieldName="vitalSigns.oxygenSaturation"
                      value={watch('vitalSigns.oxygenSaturation')}
                      isRequired={true}
                      patientAge={patientAge}
                      patientGender={patientGender}
                    />
                  </div>
                </div>

                {/* Plan de Tratamiento */}
                <div>
                  <Label htmlFor="treatmentPlan">Plan de Tratamiento</Label>
                  <Textarea
                    id="treatmentPlan"
                    {...register('treatmentPlan')}
                    placeholder="Describa el plan terapéutico completo..."
                    className="mt-1"
                  />
                  {errors.treatmentPlan && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.treatmentPlan.message}
                    </p>
                  )}
                  <MedicalFieldValidator
                    fieldName="treatmentPlan"
                    value={watch('treatmentPlan')}
                    isRequired={true}
                    patientAge={patientAge}
                    patientGender={patientGender}
                  />
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => validateFormCompletely()}
                  >
                    Validar Formulario
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={!isFormValid}
                    className={isFormValid ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {isFormValid ? '✅ Enviar Formulario' : '❌ Formulario Incompleto'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Validación */}
        <div className="space-y-6">
          {/* Verificador de Coherencia */}
          <MedicalCoherenceChecker
            formData={formData}
            patientAge={patientAge}
            patientGender={patientGender}
            onCoherenceChange={(isCoherent, alerts) => {
              console.log('Coherencia:', isCoherent, alerts);
            }}
          />

          {/* Verificador de Protocolos */}
          <MedicalProtocolChecker
            formData={formData}
            consultationType="external"
            patientAge={patientAge}
            patientRiskLevel="medium"
            onProtocolChange={(compliance, missing) => {
              console.log('Protocolos:', compliance, missing);
            }}
          />
        </div>
      </div>

      {/* Alertas Clínicas */}
      {clinicalAlerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              Alertas Clínicas ({clinicalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clinicalAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-600 mt-1">⚠️</span>
                  <div>
                    <span className="font-medium">{alert.message}</span>
                    {alert.suggestion && (
                      <p className="text-yellow-700 text-xs mt-1">
                        💡 {alert.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado del Sistema */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Estado del Sistema de Validación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-blue-600">
                {formProgress.percentage}%
              </div>
              <div className="text-sm text-gray-600">Completitud</div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(validationState.fieldErrors).filter(e => !e).length}
              </div>
              <div className="text-sm text-gray-600">Campos Válidos</div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-red-600">
                {validationState.errors.length}
              </div>
              <div className="text-sm text-gray-600">Errores</div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-yellow-600">
                {clinicalAlerts.length}
              </div>
              <div className="text-sm text-gray-600">Alertas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
