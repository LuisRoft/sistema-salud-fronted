'use client';

import { Input } from "@/components/ui/input";
import { usePatientSearch } from "@/hooks/use-patient-search";
import { useState } from "react";
import { Label } from "../ui/label";

interface PatientSearchProps {
  onPatientFound: (patientData: any) => void;
}

export function PatientSearch({ onPatientFound }: PatientSearchProps) {
  const [document, setDocument] = useState('');
  const { data: patient, isLoading } = usePatientSearch(document);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDocument(value);
    if (value.length >= 10 && patient) {
      onPatientFound(patient);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Número de Identificación del Paciente</Label>
      <Input
        type="text"
        value={document}
        onChange={handleDocumentChange}
        placeholder="Ingrese la cédula del paciente"
        className={isLoading ? "bg-gray-100" : ""}
        maxLength={10}
      />
      {isLoading && (
        <p className="text-sm text-gray-500">Buscando paciente...</p>
      )}
    </div>
  );
}
