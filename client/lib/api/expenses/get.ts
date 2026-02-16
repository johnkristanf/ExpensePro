import { ExpensesCardData, ExpensesChartData } from '@/types/dashboard'
import { Expenses } from '@/types/expenses'
import api from '../axios'

export async function fetchExpenses(): Promise<Expenses[]> {
    const response = await api.get(`/expenses`)
    return response.data
}

export async function fetchExpensesByMonth(month: string, year: number): Promise<ExpensesCardData> {
    const response = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/${month}?year=${year}`,
    )
    return await response.data
}

export async function fetchExpensesPerCategory(
    month: string,
    year: number,
): Promise<ExpensesChartData[]> {
    const response = await api.get(`/expenses/category/${month}?year=${year}`)
    return await response.data
}
