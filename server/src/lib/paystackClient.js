import axios from 'axios';

export const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  timeout: 10000,
});


paystack.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
  config.headers['Content-Type'] = 'application/json';
  return config;
});