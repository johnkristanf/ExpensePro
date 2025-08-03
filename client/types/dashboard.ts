import { Dispatch, SetStateAction } from 'react'

type CardData = {
    total: number
}

export type IncomeCardData = CardData
export type ExpensesCardData = CardData

type MergedCardData = IncomeCardData | ExpensesCardData

export interface DashboardCardProps {
    title: string
    data: MergedCardData
    selectedMonth: string
    setSelectedMonth: Dispatch<SetStateAction<string>>
}

export type IncomeChartData = {
    source: string
    amount: number
}

type Category = {
    name: string
}

export type ExpensesChartData = {
    category: Category
    amount: number
}

type MergedChartData = IncomeChartData | ExpensesChartData

export interface DashboardChartProps {
    title: string
    data: MergedChartData[]
}
