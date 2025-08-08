import { SavingsEdit } from "@/types/savings"

export async function editSavings(data: SavingsEdit) {
    const { id, ...spreadData } = data

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/savings/${id}`, {
        method: 'PATCH',
        credentials: 'include', 

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
