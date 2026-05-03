import { AccountEdit } from '@/types/accounts'
import api from '../axios'

export async function editAccount(data: AccountEdit) {
    const { id, ...spreadData } = data

    const response = await api.patch(`/accounts/${id}`, spreadData)
    return response.data
}

export async function adjustAccountBalance(
    id: number,
    amount: number,
    type: 'increment' | 'decrement',
): Promise<any> {
    const response = await api.patch(`/accounts/${id}/adjust`, {
        amount,
        type,
    })
    return response.data
}
