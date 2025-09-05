// src/services/neurologica.service.ts

import { CreateNeurologicaRequest } from '@/types/neurologica';
import { get, post } from './requestHandler';

// === Tipos ===
type PaginationParams = {
  page: number;
  limit: number;
};

export interface NeurologicaItem {
  id: string;
  name: string;
  ci: string;
  edad: number;
  discapacidad: string;
  diagnostico: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NeurologicaResponse {
  neurologicas: NeurologicaItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ScreeningFiles = {
  vistaAnterior?: File | null;
  vistaPosterior?: File | null;
  vistaLateralDerecha?: File | null;
  vistaLateralIzquierda?: File | null;
};

// === Helpers ===
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const API_BASE = `${BACKEND_URL}/api`;

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ======================================
// ============ LISTAR ==================
// ======================================
export async function getNeurologicas(
  token: string,
  params: PaginationParams
): Promise<NeurologicaResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  const endpoint = `/neurologica?${queryParams.toString()}`;

  const response = await get(endpoint, {
    headers: authHeader(token),
  });
  return response.data;
}

// ======================================
// ============ CREAR (JSON) ============
// (fallback si no hay imágenes)
// ======================================
export async function createNeurologica(
  data: CreateNeurologicaRequest,
  token: string
) {
  const response = await post('/neurologica', data, {
    headers: authHeader(token),
  });
  return response.data;
}

// ======================================
// ===== CREAR (multipart + imágenes) ====
// ===> Flujo recomendado (1 request) ✅
// ======================================
export async function createNeurologicaWithImages(
  payload: { data: CreateNeurologicaRequest; files?: ScreeningFiles },
  token: string
) {
  const fd = new FormData();
  fd.append('data', JSON.stringify(payload.data));

  // Los nombres deben coincidir con el controller
  if (payload.files?.vistaAnterior) fd.append('vistaAnterior', payload.files.vistaAnterior);
  if (payload.files?.vistaPosterior) fd.append('vistaPosterior', payload.files.vistaPosterior);
  if (payload.files?.vistaLateralDerecha) fd.append('vistaLateralDerecha', payload.files.vistaLateralDerecha);
  if (payload.files?.vistaLateralIzquierda) fd.append('vistaLateralIzquierda', payload.files.vistaLateralIzquierda);

  const resp = await fetch(`${API_BASE}/neurologica/with-images`, {
    method: 'POST',
    headers: authHeader(token), // NO poner Content-Type (lo maneja el browser)
    body: fd,
  });

  if (!resp.ok) {
    let msg = 'Error creando evaluación';
    try {
      const err = await resp.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return resp.json();
}

// ======================================
// ============ OBTENER UNA =============
// ======================================
export async function getNeurologicaById(id: string, token: string) {
  const response = await get(`/neurologica/${id}`, {
    headers: authHeader(token),
  });
  return response.data;
}

// ======================================
// ============ POR CÉDULA ==============
// ======================================
export async function getNeurologicasByCI(ci: string, token: string) {
  const response = await get(`/neurologica/by-ci/${ci}`, {
    headers: authHeader(token),
  });
  return response.data;
}

// ======================================
// ============ ACTUALIZAR (JSON) =======
// (este endpoint SÍ existe en tu backend)
// ======================================
export async function updateNeurologica(
  id: string,
  data: Partial<CreateNeurologicaRequest>,
  token: string
) {
  const resp = await fetch(`${API_BASE}/neurologica/${id}`, {
    method: 'PATCH',
    headers: {
      ...authHeader(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data || {}),
  });

  if (!resp.ok) {
    let msg = 'Error actualizando evaluación';
    try {
      const err = await resp.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return resp.json();
}

// ======================================
// === (Opcional) ACTUALIZAR con files ===
// SOLO si implementas en backend:
//   @Patch(':id/with-images')
// ======================================
export async function updateNeurologicaWithImages(
  id: string,
  payload: { data?: Partial<CreateNeurologicaRequest>; files?: ScreeningFiles },
  token: string
) {
  const fd = new FormData();
  fd.append('data', JSON.stringify(payload.data || {}));

  if (payload.files?.vistaAnterior) fd.append('vistaAnterior', payload.files.vistaAnterior);
  if (payload.files?.vistaPosterior) fd.append('vistaPosterior', payload.files.vistaPosterior);
  if (payload.files?.vistaLateralDerecha) fd.append('vistaLateralDerecha', payload.files.vistaLateralDerecha);
  if (payload.files?.vistaLateralIzquierda) fd.append('vistaLateralIzquierda', payload.files.vistaLateralIzquierda);

  const resp = await fetch(`${API_BASE}/neurologica/${id}/with-images`, {
    method: 'PATCH',
    headers: authHeader(token), // no Content-Type
    body: fd,
  });

  if (!resp.ok) {
    let msg = 'Error actualizando evaluación con imágenes';
    try {
      const err = await resp.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return resp.json();
}
