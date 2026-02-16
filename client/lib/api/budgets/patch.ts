import { BudgetEdit } from '@/types/budgets'
import api from '../axios'

// Assuming 'api' is already an axios instance with baseURL configured.
// If not, we might need to import apiBaseUrl or just use the relative path.
// Based on 'editBudget' above using 'api.patch', 'api' likely has the base URL.
// So we should remove ${apiBaseUrl} if it's not defined in this file.

export async function editBudget(data: BudgetEdit) {
    const { id, ...spreadData } = data
    const response = await api.patch(`/budgets/${id}`, spreadData)
    return response.data
}

export async function adjustBudgetBalance(
    id: number,
    amount: number,
    type: 'increment' | 'decrement',
): Promise<any> {
    const response = await api.patch(`/budgets/${id}/adjust`, {
        amount,
        type,
    })
    return response.data
}
