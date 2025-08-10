import { Categories } from '@/types/categories'
import api from '../axios'

export async function fetchCategories(): Promise<Categories[]> {
    const response = await api.get(`/categories`)
    return await response.data;
}
