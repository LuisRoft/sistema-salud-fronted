'use client';

import { useState } from 'react';
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

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  identification: z.string().min(2, {
    message: 'Número de identificación es requerido.',
  }),
  password: z.string().min(8, {
    message: 'Contraseña no debe ser menor a 8 caracteres.',
  }),
});

export default function LoginForm() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identification: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        ...values,
        redirect: false,
      });

      if (res?.error) throw new Error(res.error);

      if (res?.ok) {
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();

        if (session.user.role === 'admin') {
          router.replace('/dashboard');
        } else if (session.user.role === 'user') {
          router.replace('/pucem');
        }

        toast({
          title: 'Inicio de Sesión',
          description: 'Se ha iniciado sesión correctamente.',
        });
      }
    } catch (error: unknown) {
      if (
        (error as Error).message ===
        'Authorization error: Authorization failed: Invalid credentials.'
      ) {
        form.setError('identification', {
          type: 'manual',
          message: 'Credenciales inválidas.',
        });

        form.setError('password', {
          type: 'manual',
          message: 'Credenciales inválidas.',
        });
      } else {
        toast({
          title: 'Oh no! Algo está mal',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex w-full flex-col space-y-8'
      >
        <FormField
          control={form.control}
          name='identification'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-[#575756] dark:text-white'>
                Número de Identificación
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='1312172819'
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
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-[#575756] dark:text-white'>
                Contraseña
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    id='password'
                    className='h-10 pe-9 text-[#575756]'
                    placeholder='password'
                    type={isVisible ? 'text' : 'password'}
                    {...field}
                  />
                  <button
                    className='absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 ring-offset-background transition-shadow hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                    type='button'
                    onClick={toggleVisibility}
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isVisible}
                    aria-controls='password'
                  >
                    {isVisible ? (
                      <EyeOff size={16} strokeWidth={2} aria-hidden='true' />
                    ) : (
                      <Eye size={16} strokeWidth={2} aria-hidden='true' />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormDescription>
                Esta es su contraseña de acceso.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='mx-auto h-10 w-2/4 bg-[#164284] font-bold hover:bg-[#164284] hover:bg-opacity-85'
          disabled={isLoading}
        >
          {isLoading ? (
            <div className='flex items-center justify-center gap-2'>
              <span>Iniciando Sesión</span>
              <Loader2 className='animate-spin' size={16} strokeWidth={2} />
            </div>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>
    </Form>
  );
}
