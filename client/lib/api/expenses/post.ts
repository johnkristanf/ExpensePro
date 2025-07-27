import { ExpenseCreate } from '@/types/expenses'

export async function createExpenses(data: ExpenseCreate) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
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
