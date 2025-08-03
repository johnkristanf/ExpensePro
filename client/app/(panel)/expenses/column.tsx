'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Expenses } from '@/types/expenses'
import { formatAmount, formatDateLocaleShort } from '@/lib/utils'

export const columns: ColumnDef<Expenses>[] = [
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => <span>{row.original.description || 'N/A'}</span>,
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span>₱{formatAmount(row.original.amount)}</span>,
    },
    {
        accessorKey: 'spending_type',
        header: 'Spending Type',
    },

    {
        accessorKey: 'categories.name',
        header: 'Category',
        cell: ({ row }) => <span>{row.original.categories?.name ?? 'Unknown Category'}</span>,
    },

    {
        accessorKey: 'date',
        header: 'Date Spent',
        cell: ({ row }) => <span>{formatDateLocaleShort(row.original.date)}</span>,
    },

    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const expense = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log('Edit', expense.id)}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Delete', expense.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
