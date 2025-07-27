import { SavingsCreate } from "@/types/savings"

export async function createSavings(data: SavingsCreate) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/savings`, {
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
