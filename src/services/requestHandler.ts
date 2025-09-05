/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Configure base URL for all requests
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: `${backendUrl}/api`,
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
