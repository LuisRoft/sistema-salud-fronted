/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Configurar la base URL para todas las peticiones
const api = axios.create({
  // Asegurarnos de que la base URL no incluya /api
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const get = async (url: string, config = {}) => {
  return api.get(url, config);
};

export const post = async (url: string, data: any, config = {}) => {
  return api.post(url, data, config);
};

export const patch = async (url: string, data: any, config = {}) => {
  return api.patch(url, data, config);
};

export const del = async (url: string, config = {}) => {
  return api.delete(url, config);
};
