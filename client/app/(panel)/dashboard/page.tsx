'use client'

import { BarChartSkeleton } from '@/components/bar-chart-skeleton'
import { CardSkeleton } from '@/components/card-skeleton'
import { DashboardBarChart } from '@/components/dashboard-bar-chart'
import DashboardCard from '@/components/dashboard-card'
import PageTitle from '@/components/page-title'
import { fetchExpensesByMonth, fetchExpensesPerCategory } from '@/lib/api/expenses/get'
import { fetchIncomeByMonth, fetchIncomePerSource } from '@/lib/api/income/get'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export default function DashboardPage() {
    const [selectedIncomeByMonth, setSelectedIncomeByMonth] = useState<string>('all')
    const [selectedExpensesByMonth, setSelectedExpensesByMonth] = useState<string>('all')

    // FETCH INCOME
    const { data: income, isLoading: isIncomeLoading } = useQuery({
        queryKey: ['income_card', selectedIncomeByMonth],
        queryFn: async () => {
            return await fetchIncomeByMonth(selectedIncomeByMonth)
        },
    })

    // FETCH EXPENSES
    const { data: expenses, isLoading: isExpensesLoading } = useQuery({
        queryKey: ['expenses_card', selectedExpensesByMonth],
        queryFn: async () => {
            return await fetchExpensesByMonth(selectedExpensesByMonth)
        },
    })

    // FETCH INCOME PER SOURCE
    const { data: incomeSource, isLoading: isIncomeSourceLoading } = useQuery({
        queryKey: ['income_chart', selectedIncomeByMonth],
        queryFn: async () => {
            return await fetchIncomePerSource(selectedIncomeByMonth)
        },
    })

    // FETCH EXPENSES PER CATEGORY
    const { data: expensesCategory, isLoading: isExpensesCategoryLoading } = useQuery({
        queryKey: ['expense_chart', selectedExpensesByMonth],
        queryFn: async () => {
            return await fetchExpensesPerCategory(selectedExpensesByMonth)
        },
    })


    return (
        <div className="container mx-auto py-5">
            <PageTitle title="Dashboard" />

            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                {/* INCOME CARD DATA */}
                {isIncomeLoading || !income ? (
                    <CardSkeleton />
                ) : (
                    <DashboardCard
                        title="Income"
                        data={income}
                        selectedMonth={selectedIncomeByMonth}
                        setSelectedMonth={setSelectedIncomeByMonth}
                    />
                )}

                {/* EXPENSES CARD DATA */}
                {isExpensesLoading || !expenses ? (
                    <CardSkeleton />
                ) : (
                    <DashboardCard
                        title="Expenses"
                        data={expenses}
                        selectedMonth={selectedExpensesByMonth}
                        setSelectedMonth={setSelectedExpensesByMonth}
                    />
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
