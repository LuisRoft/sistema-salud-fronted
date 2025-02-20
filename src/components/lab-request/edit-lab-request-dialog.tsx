import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EditLabRequestForm from './edit-lab-request-form';
import { LabRequestRow } from './columns';

export default function EditLabRequestDialog({
  data,
  onClose,
}: {
  data: LabRequestRow;
  onClose: () => void;
}) {
  return (
      <DialogContent className="sm:max-w-lg">
          <DialogHeader>
              <DialogTitle>Editar Solicitud de Laboratorio</DialogTitle>
              <DialogDescription>
                  Realiza cambios en la solicitud de laboratorio y guarda cuando hayas terminado.
              </DialogDescription>
          </DialogHeader>
          <EditLabRequestForm
              onClose={onClose}
              id={data.id}  // ✅ Se pasa `id` explícitamente
              defaultValues={{ ...data }}  // ✅ Se asegura que `id` esté presente
          />
      </DialogContent>
  );
}
