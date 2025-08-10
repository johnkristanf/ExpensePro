import { LoginCredentials } from '@/types/auth'
import { web } from '../axios'

export async function login(data: LoginCredentials) {
    const response = await web.post(`/login`, data)
    return await response.data;
}
