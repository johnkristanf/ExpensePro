'use client'

import DataTable from '@/components/data-table'
import { columns } from './columns'
import PageTitle from '@/components/page-title'
import FormDialog from '@/components/form-dialog'
import { CategoriesCreate } from '@/types/categories'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategory } from '@/lib/api/categories/post'
import { toast } from 'sonner'
import { fetchCategories } from '@/lib/api/categories/get'
import TextLoader from '@/components/text-loader'
import { FieldInputType, InputType } from '@/enums/form'

export default function CategoriesPage() {
    const queryClient = useQueryClient()

    // FETCH CATEGORIES
    const { data, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    })

    // CREATE CATEGORY MUTATION
    const mutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            toast.success('Category Added Successfully')
        },

        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleCreateCategory = (data: CategoriesCreate) => {
        mutation.mutate(data)
    }

    return (
        <div className="container mx-auto py-5">
            <PageTitle title="Categories" />

            <div className="flex justify-end mb-3">
                <FormDialog
                    triggerLabel="Create Category"
                    title="New Category"
                    onSubmit={(data) => handleCreateCategory(data)}
                    fields={[
                        {
                            name: 'name',
                            label: 'Category Name',
                            type: InputType.INPUT,
                            inputType: FieldInputType.TEXT,
                            placeholder: 'e.g. Groceries',
                        },
                        {
                            name: 'notes',
                            label: 'Notes',
                            type: InputType.TEXTAREA,
                            placeholder: 'Optional notes...',
                        },
                    ]}
                />
            </div>

            {isLoading || !data ? (
                <TextLoader text="Loading Categories..." />
            ) : (
                <DataTable columns={columns} data={data} />
            )}
        </div>
    )
}
