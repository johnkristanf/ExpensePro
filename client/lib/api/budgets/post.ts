import { BudgetCreate } from '@/types/budgets'
import api from '../axios'

export async function createBudget(data: BudgetCreate) {
    const response = await api.post(`/budgets`, data)
    return response.data;
}

