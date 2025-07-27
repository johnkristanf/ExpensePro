import { Budgets } from '@/types/budgets'

export async function fetchBudgets(component: string): Promise<Budgets[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets?component=${component}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const resp = await response.json()
        throw new Error(resp.error)
    }

    return await response.json()
}
