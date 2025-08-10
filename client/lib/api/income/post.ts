import { IncomeCreate } from '@/types/income'
import api from '../axios'

export async function createIncome(data: IncomeCreate) {
    const response = await api.post(`/income`, data)
    return response.data;
}
