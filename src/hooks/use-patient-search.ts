import { useQuery } from '@tanstack/react-query';
import { getPatientByDocument } from '@/services/patientService';
import { getSession } from 'next-auth/react';

export function usePatientSearch(document: string) {
  return useQuery({
    queryKey: ['patient', document],
    queryFn: async () => {
      if (!document || document.length < 10) return null;
      const session = await getSession();
      if (!session?.user?.access_token) throw new Error('No autorizado');
      return getPatientByDocument(document, session.user.access_token);
    },
    enabled: document?.length >= 10,
  });
}
