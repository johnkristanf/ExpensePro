'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Categories } from '@/types/categories'
import { formatDateLocaleShort } from '@/lib/utils'

export const columns: ColumnDef<Categories>[] = [
    {
        accessorKey: 'name',
        header: 'Category',
    },
    {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => {
            const original = row.original
            return !original.notes ? 'N/A' : <span>{original.notes}</span>
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Date Created',
        cell: ({ row }) => {
            const original = row.original
            return <span>{formatDateLocaleShort(original.created_at)}</span>
        },
    },

    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const category = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log('Edit', category.id)}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Delete', category.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
