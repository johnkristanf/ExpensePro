import { SavingsEdit } from '@/types/savings'
import api from '../axios'

export async function editSavings(data: SavingsEdit) {
    const { id, ...spreadData } = data

    const response = await api.patch(`/savings/${id}`, spreadData)
    return response.data
}

export async function adjustSavingsBalance(
    id: number,
    amount: number,
    type: 'increment' | 'decrement',
): Promise<any> {
    const response = await api.patch(`/savings/${id}/adjust`, {
        amount,
        type,
    })
    return response.data
}
