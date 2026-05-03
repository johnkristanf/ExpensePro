import { Account } from '@/types/accounts'
import api from '../axios'

export async function fetchAccounts(): Promise<Account[]> {
    const response = await api.get(`/accounts`)
    return await response.data;
}
