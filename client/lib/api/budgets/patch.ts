import { BudgetEdit } from '@/types/budgets'

export async function editBudget(data: BudgetEdit) {
    const { id, ...spreadData } = data

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/budgets/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(spreadData),
    })

    if (!response.ok) {
        const resp = await response.json()
        throw new Error(resp.error)
    }

    return response.json()
}
