import axios from 'axios';

const API = axios.create({
    baseURL: 'https://nivant-backend.onrender.com/api',
    timeout: 60000, // increased timeout
});

// 🔐 REQUEST INTERCEPTOR
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['x-auth-token'] = token;
        }

        // 🔥 IMPORTANT: let browser handle FormData
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        console.log('Making request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data instanceof FormData ? 'FormData' : config.data
        });

        return config;
    },
    (error) => Promise.reject(error)
);

// 🔁 RESPONSE INTERCEPTOR
API.interceptors.response.use(
    (response) => {
        console.log('Response:', response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.data);
        return Promise.reject(error);
    }
);

// 🔐 AUTH
export const login = (data) => API.post('/auth/login', data);
export const verifyToken = () => API.get('/auth/verify');

// 🍽 ITEMS
export const fetchItems = () => API.get('/items');
export const fetchItemById = (id) => API.get(`/items/${id}`);
export const createItem = (formData) => API.post('/items', formData); // ✅ FIXED
export const updateItem = (id, formData) => API.put(`/items/${id}`, formData); // ✅ FIXED
export const deleteItem = (id) => API.delete(`/items/${id}`);

export default API;
