import { ExpenseCreate } from '@/types/expenses'
import api from '../axios'

export async function createExpenses(data: ExpenseCreate) {
    const response = await api.post(`/expenses`)
    return response.data;
}
