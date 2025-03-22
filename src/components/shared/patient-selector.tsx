import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Patient } from "@/services/patientService";
import { useQuery } from "@tanstack/react-query";
import { getPatientByUserAssigned } from '@/services/patientService';

interface PatientSelectorProps {
  onSelect: (patient: Patient) => void;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['userPatients'],
    queryFn: async () => {
      if (!session?.user?.access_token) {
        console.error('No session token available');
        return [];
      }
      
      // First check if user has patients in team
      const teamData = session?.user?.team;
      if (teamData?.patient && Object.values(teamData.patient).length > 0) {
        const teamPatients = Object.values(teamData.patient) as Patient[];
        console.log('✅ Using patients from team assignment:', teamPatients);
        return teamPatients;
      }
      
      // Get user ID from token
      const tokenParts = session.user.access_token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;
      
      console.log('🔑 Using token:', session.user.access_token);
      console.log('👤 User ID:', userId);
      
      try {
        return await getPatientByUserAssigned(userId, session.user.access_token);
      } catch (error) {
        console.error('Error fetching patients:', error);
        return [];
      }
    },
    enabled: !!session?.user?.access_token,
    retry: 1, // Limit retries on failure
  });

  // Debug log
  useEffect(() => {
    console.log('Current patients:', patients);
    console.log('Loading state:', isLoading);
    if (error) console.error('Error:', error);
  }, [patients, isLoading, error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Seleccionar Paciente</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Paciente</DialogTitle>
          <DialogDescription>
            Elija un paciente de su lista de asignados
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
              <span className="ml-2">Cargando pacientes...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">
              Error al cargar pacientes: {(error as Error).message}
            </div>
          ) : !patients?.length ? (
            <div className="text-gray-500 p-4">
              No hay pacientes asignados a este usuario. Por favor contacte a un administrador para que le asigne pacientes.
            </div>
          ) : (
            <div className="grid gap-2 max-h-[60vh] overflow-y-auto p-2">
           {patients.map((patient, index) => (
            <Button
              key={`${patient.id}-${index}`}  // <-- Combina el id y el índice para asegurar unicidad
              variant="outline"
              className="justify-start text-left"
              onClick={() => {
                console.log('Selecting patient:', patient);
                onSelect(patient);
                setOpen(false);
              }}
            >

                  <div>
                    <strong>{patient.lastName}, {patient.name}</strong>
                    <div className="text-sm text-gray-500">
                      Documento: {patient.document}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
