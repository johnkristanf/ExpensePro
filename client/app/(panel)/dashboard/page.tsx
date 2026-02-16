'use client'

import { BarChartSkeleton } from '@/components/bar-chart-skeleton'
import { CardSkeleton } from '@/components/card-skeleton'
import { DashboardBarChart } from '@/components/dashboard-bar-chart'
import DashboardCard from '@/components/dashboard-card'
import DashboardFilters from '@/components/dashboard-filters'
import PageTitle from '@/components/page-title'
import { fetchExpensesByMonth, fetchExpensesPerCategory } from '@/lib/api/expenses/get'
import { fetchIncomeByMonth, fetchIncomePerSource } from '@/lib/api/income/get'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export default function DashboardPage() {
    const currentYear = new Date().getFullYear()
    const [selectedMonth, setSelectedMonth] = useState<string>('all')
    const [selectedYear, setSelectedYear] = useState<number>(currentYear)

    // FETCH INCOME
    const { data: income, isLoading: isIncomeLoading } = useQuery({
        queryKey: ['income_card', selectedMonth, selectedYear],
        queryFn: async () => {
            return await fetchIncomeByMonth(selectedMonth, selectedYear)
        },
    })

    // FETCH EXPENSES
    const { data: expenses, isLoading: isExpensesLoading } = useQuery({
        queryKey: ['expenses_card', selectedMonth, selectedYear],
        queryFn: async () => {
            return await fetchExpensesByMonth(selectedMonth, selectedYear)
        },
    })

    // FETCH INCOME PER SOURCE
    const { data: incomeSource, isLoading: isIncomeSourceLoading } = useQuery({
        queryKey: ['income_chart', selectedMonth, selectedYear],
        queryFn: async () => {
            return await fetchIncomePerSource(selectedMonth, selectedYear)
        },
    })

    // FETCH EXPENSES PER CATEGORY
    const { data: expensesCategory, isLoading: isExpensesCategoryLoading } = useQuery({
        queryKey: ['expense_chart', selectedMonth, selectedYear],
        queryFn: async () => {
            return await fetchExpensesPerCategory(selectedMonth, selectedYear)
        },
    })


    return (
        <div className="container mx-auto py-5">
            <PageTitle title="Dashboard" />

            <div className='w-full flex justify-end items-center'>

                <DashboardFilters
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                />
            </div>

            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                {/* INCOME CARD DATA */}
                {isIncomeLoading || !income ? (
                    <CardSkeleton />
                ) : (
                    <DashboardCard title="Income" data={income} />
                )}

                {/* EXPENSES CARD DATA */}
                {isExpensesLoading || !expenses ? (
                    <CardSkeleton />
                ) : (
                    <DashboardCard title="Expenses" data={expenses} />
                )}

                {/* INCOME BAR CHART DATA */}
                {isIncomeSourceLoading || !incomeSource ? (
                    <BarChartSkeleton />
                ) : (
                    <DashboardBarChart title="Income Per Source" data={incomeSource} />
                )}

                {/* EXPENSES BAR CHART DATA */}
                {isExpensesCategoryLoading || !expensesCategory ? (
                    <BarChartSkeleton />
                ) : (
                    <DashboardBarChart title="Expenses per Category" data={expensesCategory} />
                )}
            </div>
        </div>
    )
}
