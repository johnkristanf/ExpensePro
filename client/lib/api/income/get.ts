import { IncomeCardData, IncomeChartData } from '@/types/dashboard'
import { Income } from '@/types/income'

export async function fetchIncome(): Promise<Income[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
        method: 'GET',
        credentials: 'include', 

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

export async function fetchIncomeByMonth(month: string): Promise<IncomeCardData> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income/${month}`, {
        method: 'GET',
        credentials: 'include', 

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

export async function fetchIncomePerSource(month: string): Promise<IncomeChartData[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income/source/${month}`, {
        method: 'GET',
        credentials: 'include', 

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
