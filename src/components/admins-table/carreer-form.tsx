'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from 'next-auth/react';
import { Career } from '@/types/career/get-careers';
import { getCareers, createCareer, updateCareer, deleteCareer } from '@/services/careerService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function CareerForm({ onClose, onSelect }: { onClose: () => void; onSelect: (career: Career) => void }) {
  const [careers, setCareers] = useState<Career[] | []>([]);
  const [newCareerName, setNewCareerName] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const { toast } = useToast();

  const fetchToken = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session || !session.user?.access_token) return;
      setToken(session.user.access_token);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  }, []);

  const fetchCareers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getCareers(token);
      setCareers(response);
    } catch (error) {
      console.error('Error fetching careers:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las carreras.',
        variant: 'destructive',
      });
    }
  }, [token, toast]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    if (token) fetchCareers();
  }, [token, fetchCareers]);

  const handleCreateCareer = async () => {
    if (!token || !newCareerName.trim()) return;
    try {
      await createCareer({ careerName: newCareerName }, token);
      toast({ title: 'Éxito', description: 'Carrera creada exitosamente.' });
      setNewCareerName('');
      fetchCareers();
    } catch (error) {
      console.error('Error creating career:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la carrera.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCareer = async (updatedCareer: Career) => {
    if (!token || !editingCareer) return;
    try {
      await updateCareer({ careerName: updatedCareer.careerName }, editingCareer.id, token);
      toast({ title: 'Éxito', description: 'Carrera actualizada exitosamente.' });
      setEditingCareer(null);
      fetchCareers();
    } catch (error) {
      console.error('Error updating career:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la carrera.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCareer = async (id: string) => {
    if (!token) return;
    try {
      await deleteCareer(id, token);
      toast({ title: 'Éxito', description: 'Carrera eliminada exitosamente.' });
      fetchCareers();
    } catch (error) {
      console.error('Error deleting career:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la carrera.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 uppercase">Gestión de Carreras</h2>

      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Nueva carrera"
          value={newCareerName}
          onChange={(e) => setNewCareerName(e.target.value)}
        />
        <Button onClick={handleCreateCareer}>Agregar</Button>
      </div>

      <ul className="space-y-2">
        {careers.map((career) => (
          <li key={career.id} className="flex items-center gap-4">
            <Button
              variant="outline"
              className="flex-1 justify-start"
              onClick={() => {
                onSelect(career);
                onClose();
              }}
            >
              {career.careerName}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditingCareer(career)}
            >
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteCareer(career.id)}
            >
              Eliminar
            </Button>
          </li>
        ))}
      </ul>

      {editingCareer && (
        <div className="mt-4">
          <h3 className="text-md font-bold mb-2 uppercase">Editar Carrera</h3>
          <Input
            value={editingCareer.careerName}
            onChange={(e) =>
              setEditingCareer({ ...editingCareer, careerName: e.target.value })
            }
          />
          <Button
            className="mt-2"
            onClick={() => handleUpdateCareer(editingCareer)}
          >
            Actualizar
          </Button>
        </div>
      )}

      <Button className="mt-4" onClick={onClose} variant="secondary">
        Cerrar
      </Button>
    </div>
  );
}
