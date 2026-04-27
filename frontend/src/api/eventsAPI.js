import API from './axiosInstance';

export const getEvents = (params) => API.get('/events/', {params});
export const getEventById = (id) => API.get(`/events/${id}/`);
export const getMyEvents = () => API.get('/events/mine/');
export const getMyRSVPs = () => API.get('/events/attending/');
export const createEvent = (data) => API.post('/events/', data, {
    headers: {'Content-Type': 'multipart/form-data'},
});
export const updateEvent = (id, data) => API.patch(`/events/${id}/`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}/`);
export const rsvpEvent = (id, status) => API.post(`/events/${id}/rsvp/`, {status});
