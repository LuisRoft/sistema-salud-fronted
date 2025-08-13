/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Configure base URL for all requests
const api = axios.create({
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
