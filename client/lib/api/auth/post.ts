import { LoginCredentials } from '@/types/auth'
import api from '../axios'

export async function login(data: LoginCredentials) {
    const response = await api.post(`${process.env.NEXT_PUBLIC_WEB_SERVER_URL}/login`, data)
    return response.data;
}
