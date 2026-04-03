// src/api/authAPI.js
import API from './axiosInstance';
export const registerUser    = (data) => API.post('/auth/register/', data);
export const loginUser       = (data) => API.post('/auth/login/', data);
export const logoutUser      = (refresh) => API.post('/auth/logout/', { refresh });
export const getProfile      = () => API.get('/auth/profile/');
export const updateProfile   = (data) => API.patch('/auth/profile/', data);
export const changePassword  = (data) => API.post('/auth/change-password/', data);
