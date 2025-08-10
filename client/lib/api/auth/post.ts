import { LoginCredentials } from '@/types/auth'
import api, { web } from '../axios'

export async function login(data: LoginCredentials) {
    const response = await web.post(`/login`, data)
    return response.data;
}
