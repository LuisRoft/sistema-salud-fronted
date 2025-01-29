import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EditCaregiverForm from './edit-caregiver-form';
import { Caregiver } from './columns';

export default function EditCaregiverDialog({
  data,
  onClose,
}: {
  data: Caregiver;
  onClose: () => void;
}) {
  // Convertir los datos para que coincidan con el tipo esperado
  const formattedData = {
    ...data,
    gender: data.gender.toLowerCase() as 'male' | 'female',
    cellphoneNumbers: data.cellphoneNumbers[0],
    conventionalNumbers: data.conventionalNumbers?.[0],
  };

  return (
    <DialogContent className='sm:max-w-xl'>
      <DialogHeader>
        <DialogTitle>Editar Cuidador</DialogTitle>
        <DialogDescription>
          Realiza cambios en la información del cuidador y guarda cuando hayas terminado.
        </DialogDescription>
      </DialogHeader>
      <EditCaregiverForm onClose={onClose} id={data.id} defaultValues={formattedData} />
    </DialogContent>
  );
} 