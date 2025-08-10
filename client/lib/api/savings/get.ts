import { Savings } from '@/types/savings'
import api from '../axios'

export async function fetchSavings(): Promise<Savings[]> {
    const response = await api.get(`/savings`)
    return await response.data;
}
