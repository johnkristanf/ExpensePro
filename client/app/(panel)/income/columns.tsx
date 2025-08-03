'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { formatAmount, formatDateLocaleShort } from '@/lib/utils'
import { Income } from '@/types/income'

export const columns: ColumnDef<Income>[] = [
    {
        accessorKey: 'source',
        header: 'Source',
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span>₱{formatAmount(row.original.amount)}</span>,
    },

    {
        accessorKey: 'date_acquired',
        header: 'Date',
        cell: ({ row }) => <span>{formatDateLocaleShort(row.original.date_acquired)}</span>,
    },

    {
        accessorKey: 'created_at',
        header: 'Date Created',
        cell: ({ row }) => <span>{formatDateLocaleShort(row.original.created_at)}</span>,
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
