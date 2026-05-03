'use client'

import DataTable from '@/components/data-table'
import PageTitle from '@/components/page-title'
import TextLoader from '@/components/text-loader'
import { Expenses, ExpenseCreate } from '@/types/expenses'
import FormDialog from '@/components/create-form-dialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createExpenses } from '@/lib/api/expenses/post'
import { deleteExpense } from '@/lib/api/expenses/delete'
import { FieldInputType, InputType } from '@/enums/form'
import { SpendingType } from '@/enums/expenses'
import { fetchCategories } from '@/lib/api/categories/get'
import { columns as getColumns } from './column'
import { fetchExpenses } from '@/lib/api/expenses/get'
import { fetchBudgets } from '@/lib/api/budgets/get'
import { BudgetFetchComponent } from '@/enums/budgets'
import { useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ExpensesPage() {
    const queryClient = useQueryClient()

    // FETCH CATEGORIES
    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    })

    // FETCH BUDGETS CATEGORIES
    const { data: budgets, isLoading: isBudgetsLoading } = useQuery({
        queryKey: ['budgets'],
        queryFn: async () => {
            return await fetchBudgets(BudgetFetchComponent.DROPDOWN)
        },
    })

    // FETCH EXPENSES
    const { data: expenses, isLoading: isExpensesLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: fetchExpenses,
    })

    // CREATE EXPENSE MUTATION
    const mutation = useMutation({
        mutationFn: createExpenses,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] })
            toast.success('Expenses Added Successfully')
        },

        onError: (error: any) => {
            console.log("error: ", error);
            toast.error(error.response.data.message)
        },
    })

    // DELETE EXPENSE MUTATION
    const deleteMutation = useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] })
            queryClient.invalidateQueries({ queryKey: ['budgets'] })
            toast.success('Expense Deleted Successfully')
        },
        onError: (error: any) => {
            console.log("error: ", error);
            toast.error(error.response?.data?.message || 'Failed to delete expense')
        },
    })

    const handleCreateExpense = (data: ExpenseCreate) => {
        mutation.mutate(data)
    }

    const handleDeleteExpense = (id: number) => {
        deleteMutation.mutate(id)
    }

    // FILTERS
    const [budgetFilter, setBudgetFilter] = useState<string>('all')
    const [spendingTypeFilter, setSpendingTypeFilter] = useState<string>('all')
    const [dateFromFilter, setDateFromFilter] = useState<string>('')
    const [dateToFilter, setDateToFilter] = useState<string>('')

    const filteredExpenses = useMemo(() => {
        if (!expenses) return []
        return expenses.filter((expense) => {
            if (budgetFilter !== 'all' && expense.budgets?.id?.toString() !== budgetFilter) return false
            if (spendingTypeFilter !== 'all' && expense.spending_type !== spendingTypeFilter) return false
            if (dateFromFilter && expense.date_spent < dateFromFilter) return false
            if (dateToFilter && expense.date_spent > dateToFilter) return false
            return true
        })
    }, [expenses, budgetFilter, spendingTypeFilter, dateFromFilter, dateToFilter])

    return (
        <div className="container mx-auto py-5">
            <PageTitle title="Expenses" />

            {/* FILTERS & ADD NEW EXPENSE */}
            <div className="flex flex-col md:flex-row justify-end items-end mb-6 gap-4">
                <div className="flex flex-wrap items-end justify-end gap-4 w-full md:w-auto">
                    <div className="space-y-1">
                        <Label>Budget</Label>
                        <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Budgets" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Budgets</SelectItem>
                                {budgets?.map((budget) => (
                                    <SelectItem key={budget.id} value={budget.id.toString()}>
                                        {budget.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Spending Type</Label>
                        <Select value={spendingTypeFilter} onValueChange={setSpendingTypeFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value={SpendingType.WANTS}>Wants</SelectItem>
                                <SelectItem value={SpendingType.NEEDS}>Needs</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Date From</Label>
                        <Input 
                            type="date" 
                            value={dateFromFilter} 
                            onChange={(e) => setDateFromFilter(e.target.value)}
                            className="w-[150px]"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Date To</Label>
                        <Input 
                            type="date" 
                            value={dateToFilter} 
                            onChange={(e) => setDateToFilter(e.target.value)}
                            className="w-[150px]"
                        />
                    </div>
                </div>

                <FormDialog
                    triggerLabel="Create Expense"
                    title="New Expense"
                    onSubmit={(data) => handleCreateExpense(data)}
                    fields={[
                        {
                            name: 'category_id',
                            label: 'Category',
                            type: InputType.SELECT,
                            options:
                                categories &&
                                categories.map((cat) => ({
                                    label: cat.name,
                                    value: cat.id.toString(),
                                })),
                        },

                        {
                            name: 'budget_id',
                            label: 'Budget',
                            type: InputType.SELECT,
                            options:
                                budgets &&
                                budgets.map((budget) => ({
                                    label: budget.name,
                                    value: budget.id.toString(),
                                })),
                        },

                        {
                            name: 'description',
                            label: 'Description',
                            type: InputType.INPUT,
                            inputType: FieldInputType.TEXT,
                            placeholder: 'e.g. Night Out w/ Friends, Bus Transportation to Tagum',
                        },
                        {
                            name: 'amount',
                            label: 'Amount',
                            type: InputType.INPUT,
                            inputType: FieldInputType.NUMBER,
                        },

                        {
                            name: 'spending_type',
                            label: 'Spending Type',
                            type: InputType.SELECT,
                            options: [
                                { label: SpendingType.WANTS, value: SpendingType.WANTS },
                                { label: SpendingType.NEEDS, value: SpendingType.NEEDS },
                            ],
                        },

                        {
                            name: 'date_spent',
                            label: 'Date Spent',
                            type: InputType.INPUT,
                            inputType: FieldInputType.DATE,
                        },
                    ]}
                />
            </div>

            {isExpensesLoading || !expenses ? (
                <div className="flex justify-center">
                    <TextLoader text="Loading Expenses..." />
                </div>
            ) : (
                <DataTable columns={getColumns(handleDeleteExpense)} data={filteredExpenses} />
            )}
        </div>
    )
}
