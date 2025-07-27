import { Savings } from '@/types/savings'

export async function fetchSavings(): Promise<Savings[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/savings`, {
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
