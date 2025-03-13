import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EditAdminForm from './edit-admin-form';
import { Admin } from './columns';

export default function EditAdminDialog({
  data,
  onClose,
}: {
  data: Admin;
  onClose: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="uppercase">Editar Administrador</DialogTitle>
        <DialogDescription className="uppercase">
          Realiza cambios en la información del administrador y guarda cuando hayas terminado.
        </DialogDescription>
      </DialogHeader>
      <EditAdminForm
        onClose={onClose}
        id={data.id}
        defaultValues={{
          ...data,
          career: typeof data.career === 'string'
            ? { id: data.career, careerName: '' } // 🔹 Si `career` es string, lo convertimos a objeto
            : data.career ?? undefined, // 🔹 Si ya es objeto, lo dejamos igual; si es null, lo hacemos `undefined`
        }}
      />
    </DialogContent>
  );
}
