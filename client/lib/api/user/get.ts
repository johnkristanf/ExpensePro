import api from '../axios'

export async function fetchUser() {
    const response = await api.get('/user')
    return response.data
}
