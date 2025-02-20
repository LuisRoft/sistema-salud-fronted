/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return instance.get<T>(url, config);
};

export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return instance.post<T>(url, data, config);
};

export const patch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return instance.patch<T>(url, data, config);
};

export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return instance.delete<T>(url, config);
};
