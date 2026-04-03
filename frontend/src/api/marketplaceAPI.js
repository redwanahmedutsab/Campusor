// src/api/marketplaceAPI.js
import API from './axiosInstance';

export const getCategories   = ()         => API.get('/marketplace/categories/');
export const getProducts     = (params)   => API.get('/marketplace/products/', { params });
export const getProductById  = (id)       => API.get(`/marketplace/products/${id}/`);
export const getMyProducts   = ()         => API.get('/marketplace/products/mine/');
export const createProduct   = (formData) => API.post('/marketplace/products/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateProduct   = (id, data) => API.patch(`/marketplace/products/${id}/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteProduct   = (id)       => API.delete(`/marketplace/products/${id}/`);
export const markSold        = (id)       => API.post(`/marketplace/products/${id}/mark-sold/`);
