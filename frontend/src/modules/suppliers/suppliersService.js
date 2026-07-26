import api from "../../api/api.js";

const API_URL = "/suppliers";

export const getSuppliers = () => api.get(API_URL);

export const createSupplier = (data) =>
  api.post(API_URL, data);

export const updateSupplier = (id, data) =>
  api.put(`${API_URL}/${id}`, data);

export const deleteSupplier = (id) =>
  api.delete(`${API_URL}/${id}`);


