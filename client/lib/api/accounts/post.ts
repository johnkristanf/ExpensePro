import { AccountInsert } from '@/types/accounts'
import api from '../axios'

export async function createAccount(data: AccountInsert) {
    const response = await api.post(`/accounts`, data)
    return response.data
}
