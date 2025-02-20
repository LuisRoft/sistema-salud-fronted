'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { any, z } from 'zod';

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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { updateTeam } from '@/services/teamsService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { getGroups } from '@/services/groupsService';
import { useState } from 'react';
import { getPatients } from '@/services/patientService';
import { Team } from '@/components/teams-table/columns';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditTeamForm } from './EditTeamForm';

const formSchema = z.object({
  teamName: z.string().min(10, {
    message: 'Nombre del equipo es requerido.',
  }),
  groupId: z.string().min(1, {
    message: 'Grupo es requerido.',
  }),
  patientId: z.string().min(1, {
    message: 'Paciente asignado es requerido.',
  }),
});

interface EditTeamDialogProps {
  data: Team;
  onClose: () => void;
}

export default function EditTeamDialog({ data, onClose }: EditTeamDialogProps) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar Equipo</DialogTitle>
        <DialogDescription>
          Realiza cambios en la información del equipo y guarda cuando hayas terminado.
        </DialogDescription>
      </DialogHeader>
      <EditTeamForm onClose={onClose} team={data} />
    </DialogContent>
  );
}