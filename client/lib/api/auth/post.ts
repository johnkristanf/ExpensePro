import { LoginCredentials } from '@/types/auth'
import api from '../axios'

export async function login(data: LoginCredentials) {
    const response = await api.post(`/login`, data)
    return response.data;
}
