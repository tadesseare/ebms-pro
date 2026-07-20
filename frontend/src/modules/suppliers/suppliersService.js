import axios from "axios";

const API_URL = "http://localhost:5000/api/suppliers";

function authHeader() {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

export const getSuppliers = () => axios.get(API_URL, authHeader());

export const createSupplier = (data) =>
  axios.post(API_URL, data, authHeader());

export const updateSupplier = (id, data) =>
  axios.put(`${API_URL}/${id}`, data, authHeader());

export const deleteSupplier = (id) =>
  axios.delete(`${API_URL}/${id}`, authHeader());


