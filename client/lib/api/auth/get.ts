import api from '../axios'

export async function getCrsfCookie() {
    await api.get(`/sanctum/csrf-cookie`)
}
