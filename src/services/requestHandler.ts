/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, ''); // Removemos la barra final si existe

const formatUrl = (url: string) => {
  // Aseguramos que la URL comience con una sola barra
  return url.startsWith('/') ? url : `/${url}`;
};

export const get = async (url: string, config = {}) => {
  try {
    const formattedUrl = formatUrl(url);
    console.log('Making request to:', `${baseURL}${formattedUrl}`);
    console.log('Config:', config);
    
    const response = await axios.get(`${baseURL}${formattedUrl}`, {
      ...config,
      validateStatus: (status) => status < 500, // Acepta cualquier estado < 500
    });

    if (response.status === 403) {
      throw new Error('No tienes permiso para acceder a este recurso');
    }

    if (!response.data) {
      throw new Error('No se recibieron datos del servidor');
    }

    return response;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};

export const post = async (
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  const formattedUrl = formatUrl(url);
  return axios.post(`${baseURL}${formattedUrl}`, data, config);
};

export const patch = async (
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  const formattedUrl = formatUrl(url);
  return axios.patch(`${baseURL}${formattedUrl}`, data, config);
};

export const del = async (
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  const formattedUrl = formatUrl(url);
  return axios.delete(`${baseURL}${formattedUrl}`, config);
};
