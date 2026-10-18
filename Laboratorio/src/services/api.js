import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000', // <--- 3000 (El puerto de Express)
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

export default api;