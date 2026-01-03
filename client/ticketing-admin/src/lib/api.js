import axios from 'axios';
import { useAuth } from '../context/useAuth';

export const useApi = () => {
    const { token } = useAuth();

    const client = axios.create({
        baseURL: 'http://localhost:4000',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // console.log('using token:', token);
    return client;
}