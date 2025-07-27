import { Expenses } from '@/types/expenses'

export async function fetchExpenses(): Promise<Expenses[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
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
