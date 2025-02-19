import { del, get, patch, post } from './requestHandler';

export const createLaboratoryRequest = async (data: any, token: any) => {
  const res = await post('/api/laboratory-request', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getLaboratoryRequests = async (token: any) => {
  const res = await get('/api/laboratory-request', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getLaboratoryRequestById = async (id: any, token: any) => {
  const res = await get(`/api/laboratory-request/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateLaboratoryRequest = async (id: any, data: any, token: any) => {
  const res = await patch(`/api/laboratory-request/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const deleteLaboratoryRequest = async (id: any, token: any) => {
  const res = await del(`/api/laboratory-request/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
