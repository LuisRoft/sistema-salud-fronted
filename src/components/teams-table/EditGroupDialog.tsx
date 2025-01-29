'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { updateGroup } from '@/services/groupsService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const editGroupSchema = z.object({
  groupName: z.string().min(1, 'El nombre del grupo no puede estar vacío.'),
});

type EditGroupFormValues = z.infer<typeof editGroupSchema>;

type dataGroup = {
    id: number;
    groupName: string;
    };
    
export default function EditGroupDialog({
  isOpen,
  setIsOpen,
  dataGroup,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dataGroup: dataGroup;
}) {

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditGroupFormValues>({
    resolver: zodResolver(editGroupSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: EditGroupFormValues) => {
      const session = await getSession();
      const token = session?.user.access_token;
      await updateGroup(data, token as string, dataGroup.id);
    },
    onSuccess: () => {
      toast({
        title: 'Grupo editado',
        description: 'El grupo ha sido editado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      form.reset();
      setIsOpen(false);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: EditGroupFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
          <DialogDescription>
            Ingresa el nombre del grupo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Input
              placeholder='Nombre del grupo'
              {...form.register('groupName')}
            />
            <p className='text-sm text-red-600'>
              {form.formState.errors.groupName?.message}
            </p>
          </div>
          <Button
            type='submit'
            className='w-full'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <div className='flex items-center justify-center gap-2'>
                <span>Editando Grupo</span>
                <Loader2 className='animate-spin' size={16} strokeWidth={2} />
              </div>
            ) : (
              'Editar Grupo'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
