'use client';

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConsultationFiltersProps {
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  searchFilter: string;
  setSearchFilter: (value: string) => void;
}

export function ConsultationFilters({
  typeFilter,
  setTypeFilter,
  searchFilter,
  setSearchFilter,
}: ConsultationFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Tipo de Consulta:</label>
        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Consulta Externa">Consulta Externa</SelectItem>
            <SelectItem value="Consulta Interna">Consulta Interna</SelectItem>
            <SelectItem value="Consulta Enfermería">Consulta Enfermería</SelectItem>
            <SelectItem value="Solicitud Laboratorio">Solicitud Laboratorio</SelectItem>
            <SelectItem value="Evaluación Neurológica">Evaluación Neurológica</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Buscar por Nombre/Cédula:</label>
        <Input
          type="search"
          placeholder="Buscar..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
}
