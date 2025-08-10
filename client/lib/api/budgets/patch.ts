import { BudgetEdit } from '@/types/budgets'
import api from '../axios'

export async function editBudget(data: BudgetEdit) {
    const { id, ...spreadData } = data
    const response = await api.patch(`/budgets/${id}`, spreadData)
    return response.data;
}
