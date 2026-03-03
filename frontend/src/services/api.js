import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 30000, // Increase timeout for file uploads
});

// Add request interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['x-auth-token'] = token;
        }
        
        // Don't set Content-Type for multipart/form-data
        // Let the browser set it with the correct boundary
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
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
API.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response error:', {
            url: error.config?.url,
            message: error.message,
            response: error.response?.data
        });
        return Promise.reject(error);
    }
);

export const login = (formData) => API.post('/auth/login', formData);
export const verifyToken = () => API.get('/auth/verify');

export const fetchItems = () => API.get('/items');
export const createItem = (formData) => API.post('/items', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const updateItem = (id, formData) => API.put(`/items/${id}`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const deleteItem = (id) => API.delete(`/items/${id}`);

export const fetchOrders = () => API.get('/orders');
export const fetchPendingOrders = () => API.get('/orders/pending');
export const createOrder = (orderData) => API.post('/orders', orderData);
export const updateOrderStatus = (id, data) => {
    console.log('API call - updateOrderStatus:', { id, data });
    return API.put(`/orders/${id}/status`, data);
};export const updateOrder = (id, orderData) => API.put(`/orders/${id}`, orderData);
export const generateBill = (id, discount) => API.post(`/orders/${id}/bill`, { discount });

export default API;