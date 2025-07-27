import { BudgetCreate } from '@/types/budgets'

export async function createBudget(data: BudgetCreate) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const resp = await response.json()
        throw new Error(resp.error)
    }

    return response.json()
}
