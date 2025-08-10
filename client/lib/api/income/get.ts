import { IncomeCardData, IncomeChartData } from '@/types/dashboard'
import { Income } from '@/types/income'
import api from '../axios'

export async function fetchIncome(): Promise<Income[]> {
    const response = await api.get(`/income`)
    return await response.data;
}

export async function fetchIncomeByMonth(month: string): Promise<IncomeCardData> {
    const response = await api.get(`/income/${month}`)
    return await response.data;
}

export async function fetchIncomePerSource(month: string): Promise<IncomeChartData[]> {
    const response = await api.get(`/income/source/${month}`)
    return await response.data;
}
