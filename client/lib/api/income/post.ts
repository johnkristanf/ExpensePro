import { IncomeCreate } from '@/types/income'

export async function createIncome(data: IncomeCreate) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
        method: 'POST',
        credentials: 'include', 

        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const resp = await response.json()
        throw new Error(resp.errors ?? resp.error)
    }

    return response.json()
}
