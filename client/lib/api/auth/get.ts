import { web } from '../axios'

export async function getCrsfCookie() {
    await web.get(`/sanctum/csrf-cookie`)
}
