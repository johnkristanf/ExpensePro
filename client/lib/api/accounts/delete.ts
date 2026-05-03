import api from '../axios'

export async function deleteAccount(id: number) {
    const response = await api.delete(`/accounts/${id}`)
    return response.data
}
