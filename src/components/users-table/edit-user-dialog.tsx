import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CreateUserForm from './create-user-form';

export default function EditUserDialog({ user }: { user: any }) {
  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogDescription>
          Realiza cambios en la información del usuario y guarda cuando hayas
          terminado.
        </DialogDescription>
      </DialogHeader>
      <CreateUserForm
        onClose={() => {}}
        defaultValues={user}
        isEditMode={true}
      />
    </DialogContent>
  );
}
