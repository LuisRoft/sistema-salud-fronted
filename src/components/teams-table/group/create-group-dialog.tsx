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
import { createGroup } from '@/services/groupsService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const createGroupSchema = z.object({
  groupName: z.string().min(1, 'El nombre del grupo no puede estar vacío.'),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

export default function CreateGroupDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateGroupFormValues) => {
      const session = await getSession();
      const token = session?.user.access_token;
      await createGroup(data, token as string);
    },
    onSuccess: () => {
      toast({
        title: 'Grupo creado',
        description: 'El grupo ha sido creado exitosamente.',
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

  const onSubmit = (values: CreateGroupFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Grupo</DialogTitle>
          <DialogDescription>
            Ingresa el nombre del grupo para crearlo.
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
                <span>Creando Grupo</span>
                <Loader2 className='animate-spin' size={16} strokeWidth={2} />
              </div>
            ) : (
              'Crear Grupo'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
