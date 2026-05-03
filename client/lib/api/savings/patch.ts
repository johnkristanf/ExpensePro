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
    accountId?: number,
    reason?: string
): Promise<any> {
    const payload: any = { amount, type }
    if (accountId) payload.account_id = accountId
    if (reason) payload.reason = reason

    const response = await api.patch(`/savings/${id}/adjust`, payload)
    return response.data
}
