import { IncomeCardData, IncomeChartData } from '@/types/dashboard'
import { Income } from '@/types/income'
import api from '../axios'

export async function fetchIncome(): Promise<Income[]> {
    const response = await api.get(`/income`)
    return await response.data
}

export async function fetchIncomeByMonth(month: string, year: number): Promise<IncomeCardData> {
    const response = await api.get(`/income/${month}?year=${year}`)
    return await response.data
}

export async function fetchIncomePerSource(
    month: string,
    year: number,
): Promise<IncomeChartData[]> {
    const response = await api.get(`/income/source/${month}?year=${year}`)
    return await response.data
}
