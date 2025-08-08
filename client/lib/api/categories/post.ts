import { CategoriesCreate } from '@/types/categories'

export async function createCategory(data: CategoriesCreate) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: 'POST',
        credentials: 'include', 

        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const resp = await response.json()
        throw new Error(resp.error)
    }

    return await response.json()
}
