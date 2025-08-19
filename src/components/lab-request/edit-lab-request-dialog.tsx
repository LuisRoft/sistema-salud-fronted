import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EditLabRequestForm from './edit-lab-request-form';
import { LabRequestRow } from './columns';
import { LabRequestManagementRow } from './management-columns';

export default function EditLabRequestDialog({
  data,
  onClose,
}: {
  data: LabRequestRow | LabRequestManagementRow;
  onClose: () => void;
}) {
  return (
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
