import { Budgets } from '@/types/budgets'
import api from '../axios'

export async function fetchBudgets(component: string): Promise<Budgets[]> {
    const response = await api.get(`/budgets?component=${component}`)
    return await response.data;
}
