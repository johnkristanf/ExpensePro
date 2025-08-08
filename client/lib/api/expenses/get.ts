import { ExpensesCardData, ExpensesChartData } from '@/types/dashboard'
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

export async function fetchExpensesByMonth(month: string): Promise<ExpensesCardData> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${month}`, {
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

export async function fetchExpensesPerCategory(month: string): Promise<ExpensesChartData[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/category/${month}`, {
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
