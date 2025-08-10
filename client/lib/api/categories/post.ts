import { CategoriesCreate } from '@/types/categories'
import api from '../axios'

export async function createCategory(data: CategoriesCreate) {
    const response = await api.post(`/categories`, data)
    return await response.data;
}
