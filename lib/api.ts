import axios from 'axios'

const API_URL = process.env.API_URL as string;
const API_USERNAME = process.env.API_USERNAME as string;
const API_PASSWORD = process.env.API_PASSWORD as string;
const API_TOKEN = process.env.API_TOKEN as string;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export default api;
