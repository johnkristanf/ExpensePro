'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash } from 'lucide-react'
import { Expenses } from '@/types/expenses'
import { formatAmount, formatDateLocaleShort } from '@/lib/utils'
import EditFormDialog from '@/components/edit-form-dialog'
import { expensesToFieldSchemas } from '@/lib/helpers/field-mapping'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/lib/api/categories/get'
import { fetchBudgets } from '@/lib/api/budgets/get'
import { BudgetFetchComponent } from '@/enums/budgets'

export const columns: ColumnDef<Expenses>[] = [
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => <span>{row.original.description || 'N/A'}</span>,
    },
    {
        accessorKey: 'budgets.name',
        header: 'Budget',
        cell: ({ row }) => <span>{row.original.budgets?.name ?? 'N/A'}</span>,
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span>₱{formatAmount(row.original.amount)}</span>,
    },
    {
        accessorKey: 'spending_type',
        header: 'Spending Type',
        cell: ({ row }) => (
            <span className={row.original.spending_type === 'WANTS' ? 'text-red-500' : ''}>
                {row.original.spending_type}
            </span>
        ),
    },

    {
        accessorKey: 'categories.name',
        header: 'Category',
        cell: ({ row }) => <span>{row.original.categories?.name ?? 'Unknown Category'}</span>,
    },

    {
        accessorKey: 'date_spent',
        header: 'Date Spent',
        cell: ({ row }) => <span>{formatDateLocaleShort(row.original.date_spent)}</span>,
    },

    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
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

            const expense = row.original
            if (isCategoriesLoading || isBudgetsLoading || !categories || !budgets) return null;

            // Edit expense mutatation
            

            return (
                <div className="flex items-center gap-2">
                    <EditFormDialog
                        title="Edit Expenses"
                        fields={expensesToFieldSchemas(expense, categories, budgets)}
                        onSubmit={data => console.log('edited expense data:', data)}
                    />
                    <Trash className="size-4 hover:cursor-pointer hover:opacity-75 text-red-800" />
                </div>
            );
        },
    },
]
