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
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>Editar Administrador</DialogTitle>
        <DialogDescription>
          Realiza cambios en la información del administrador y guarda cuando
          hayas terminado.
        </DialogDescription>
      </DialogHeader>
      <EditAdminForm onClose={onClose} id={data.id} defaultValues={data} />
    </DialogContent>
  );
}
