'use client';


import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SimpleModeToggle } from '@/components/ui/simple-mode-toggle';


const formSchema = z.object({
  identification: z.string().min(10, {
    message: 'Número de identificación es requerido.',
  }),
  password: z.string().min(8, {
    message: 'Contraseña no debe ser menor a 8 caracteres.',
  }),
});

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identification: '',
      password: '',
    },
  });

  useEffect(() => {
    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
      const { title, description, time } = JSON.parse(logoutMessage);
      if (Date.now() - time < 5000) {
        toast({ title, description, duration: 3000 });
      }
      localStorage.removeItem('logoutMessage');
    }
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        identification: values.identification,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        toast({
          title: 'Error de autenticación',
          description: 'Credenciales incorrectas',
          variant: 'destructive',
          duration: 3000,
        });
        return
      }

      toast({ title: '¡Bienvenido!', description: 'Inicio de sesión exitoso', duration: 3000 });
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Hubo un problema al iniciar sesión', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f0f4f8] dark:bg-gray-900">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative flex flex-col md:flex-row">
        <div className="absolute top-2 right-2 z-10">
          <SimpleModeToggle />
        </div>

        {/* Lado izquierdo - Imagen */}
        <div className="hidden md:flex md:w-1/2 bg-[#1e3a8a] p-8 flex-col items-center justify-center text-white">
          <div className="mb-10 -mt-4">
            <Image
              src="/logo-pucem-white.png"
              alt="PUCE Manabí Logo"
              width={280}
              height={130}
              priority
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-center">Sistema de Salud PUCE Manabí</h2>
          <p className="text-blue-100 text-sm text-center leading-relaxed">
            Bienvenido al sistema de gestión de salud. Tu plataforma para el cuidado integral de pacientes.
          </p>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full md:w-1/2 p-8">
          <div className="max-w-sm mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Bienvenido</h1>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">Ingrese su usuario y contraseña</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="identification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Identificación</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Cédula de Ciudadanía" className="bg-gray-50 dark:bg-gray-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={isVisible ? 'text' : 'password'} {...field} className="pr-10" placeholder="********" />
                          <button
                            type="button"
                            onClick={toggleVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-[#1e3a8a] hover:bg-blue-800" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Iniciar Sesión'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
