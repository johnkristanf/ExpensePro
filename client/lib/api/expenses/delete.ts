import api from '@/lib/api/axios'

export const deleteExpense = async (id: number) => {
    const response = await api.delete(`/expenses/${id}`)
    return response.data
}
