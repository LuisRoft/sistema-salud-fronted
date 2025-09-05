// src/services/biodigitalService.ts
import { axiosInstance } from '@/lib/axios';
import { getSession } from 'next-auth/react';

/**
 * Interfaz para la respuesta del endpoint /api-key/generate
 */
interface ApiKeyResponse {
  message: string;
  token: string;
}

export const generateBioDigitalToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/api-key/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Error al generar token: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error al generar token de BioDigital:', error);
    throw error;
  }
};

export const fetchBioDigitalData = async () => {
  try {
    // Siempre usar token dinámico del backend
    const token = await generateBioDigitalToken();

    const response = await fetch('https://apis.biodigital.com/services/v2/content/collections/myhuman', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener datos de BioDigital:', error);
    throw error;
  }
};