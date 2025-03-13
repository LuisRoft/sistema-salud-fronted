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
      
      // Get user ID from token
      const tokenParts = session.user.access_token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;
      
      console.log('🔑 Using token:', session.user.access_token);
      console.log('👤 User ID:', userId);
      
      return getPatientByUserAssigned(userId, session.user.access_token);
    },
    enabled: !!session?.user?.access_token,
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
            <div>Cargando pacientes...</div>
          ) : error ? (
            <div className="text-red-500">Error al cargar pacientes: {(error as Error).message}</div>
          ) : !patients?.length ? (
            <div className="text-gray-500">No hay pacientes asignados</div>
          ) : (
            <div className="grid gap-2">
              {patients.map((patient) => (
                <Button
                  key={patient.id}
                  variant="outline"
                  className="justify-start text-left"
                  onClick={() => {
                    console.log('Selecting patient:', patient);
                    onSelect(patient);
                    setOpen(false);
                  }}
                >
                  {patient.lastName}, {patient.name} - {patient.document}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
