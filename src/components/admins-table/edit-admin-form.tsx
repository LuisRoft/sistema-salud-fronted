import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateAdmin } from '@/services/adminService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

const editFormSchema = z.object({
  document: z.string().min(10, {
    message: 'Numero de identificacion es requerido.',
  }),
  fullName: z.string().min(1, {
    message: 'Nombre completo es requerido.',
  }),
  email: z.string().email({
    message: 'Correo electronico no valido.',
  }),
});

type EditAdminFormProps = {
  onClose: () => void;
  id: string;
  defaultValues: z.infer<typeof editFormSchema>;
};

export default function EditAdminForm({
  onClose,
  id,
  defaultValues,
}: EditAdminFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof editFormSchema>) => {
      const session = await getSession();
      const token = session?.user.access_token;
      return await updateAdmin(values, id, token as string);
    },
    onSuccess: () => {
      toast({
        title: 'Actualización Exitosa',
        description: 'Usuario actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      onClose();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Oh no! Algo está mal',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: z.infer<typeof editFormSchema>) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex w-full flex-col'
      >
        <div className='grid w-full grid-cols-2 gap-x-10 gap-y-6'>
          <FormField
            control={form.control}
            name='document'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>
                  Número de Identificación
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='1312172818'
                    {...field}
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormDescription>
                  Este es su número de identificación.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='fullName'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder='John'
                    {...field}
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormDescription>Este es su nombre.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#575756]'>
                  Correo Electrónico
                </FormLabel>
                <FormControl>
                  <Input
                    id='email'
                    {...field}
                    placeholder='test@pucesm.edu.ec'
                    className='h-10 text-[#575756]'
                  />
                </FormControl>
                <FormDescription>
                  Este es su correo electrónico.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type='submit'
          className='mt-4 justify-center bg-[#164284] font-bold hover:bg-[#164284] hover:bg-opacity-85'
          disabled={isPending}
        >
          {isPending ? (
            <div className='flex items-center justify-center gap-2'>
              <span>Actualizando Usuario</span>
              <Loader2 className='animate-spin' size={16} strokeWidth={2} />
            </div>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </form>
    </Form>
  );
}
