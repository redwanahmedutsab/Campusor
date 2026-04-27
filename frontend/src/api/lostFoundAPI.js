import API from './axiosInstance';

export const getLostFoundItems = (params) => API.get('/lost-found/', {params});
export const getLostFoundById = (id) => API.get(`/lost-found/${id}/`);
export const getMyItems = () => API.get('/lost-found/mine/');
export const createItem = (data) => API.post('/lost-found/', data, {
    headers: {'Content-Type': 'multipart/form-data'},
});
export const updateItem = (id, data) => API.patch(`/lost-found/${id}/`, data);
export const deleteItem = (id) => API.delete(`/lost-found/${id}/`);
export const markResolved = (id) => API.post(`/lost-found/${id}/resolve/`);
