'use client'

import DataTable from '@/components/data-table'
import PageTitle from '@/components/page-title'
import TextLoader from '@/components/text-loader'
import { Expenses, ExpenseCreate } from '@/types/expenses'
import FormDialog from '@/components/create-form-dialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createExpenses } from '@/lib/api/expenses/post'
import { FieldInputType, InputType } from '@/enums/form'
import { SpendingType } from '@/enums/expenses'
import { fetchCategories } from '@/lib/api/categories/get'
import { columns } from './column'
import { fetchExpenses } from '@/lib/api/expenses/get'
import { fetchBudgets } from '@/lib/api/budgets/get'
import { BudgetFetchComponent } from '@/enums/budgets'

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

    console.log('expenses: ', expenses)

    // CREATE CATEGORY MUTATION
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

    const handleCreateExpense = (data: ExpenseCreate) => {
        console.log('expense data: ', data)
        mutation.mutate(data)
    }
    return (
        <div className="container mx-auto py-5">
            <PageTitle title="Expenses" />

            {/* ADD NEW EXPSENSE */}
            <div className="flex justify-end mb-3">
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
                <DataTable columns={columns} data={expenses} />
            )}
        </div>
    )
}
