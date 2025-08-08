'use client'

import DataTable from '@/components/data-table'
import PageTitle from '@/components/page-title'
import { Income } from '@/types/income'
import { columns } from './columns'
import FormDialog from '@/components/create-form-dialog'
import { FieldInputType, InputType } from '@/enums/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createIncome } from '@/lib/api/income/post'
import TextLoader from '@/components/text-loader'
import { fetchIncome } from '@/lib/api/income/get'

export default function IncomePage() {
    const queryClient = useQueryClient()

    // FETCH INCOME
    const { data: income, isLoading: isIncomeLoading } = useQuery({
        queryKey: ['income'],
        queryFn: fetchIncome,
    })

    // CREATE INCOME MUTATION
    const mutation = useMutation({
        mutationFn: createIncome,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['income'] })
            toast.success('Income Added Successfully')
        },

        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleCreateIncome = (data: Income) => {
        mutation.mutate(data)
    }

    return (
        <div className="container mx-auto py-5">
            {/* CREATE BUDGET FORM BUTTON TRIGGER */}
            <div className="flex justify-end">
                <FormDialog
                    triggerLabel="Create Income"
                    title="New Income"
                    onSubmit={(data) => handleCreateIncome(data)}
                    fields={[
                        {
                            name: 'source',
                            label: 'Source',
                            type: InputType.INPUT,
                            inputType: FieldInputType.TEXT,
                            placeholder: 'e.g. Salary, Side Hustle',
                        },

                        {
                            name: 'amount',
                            label: 'Total Amount',
                            type: InputType.INPUT,
                            inputType: FieldInputType.NUMBER,
                        },

                        {
                            name: 'date_acquired',
                            label: 'Date Acquired',
                            type: InputType.INPUT,
                            inputType: FieldInputType.DATE,
                        },
                    ]}
                />
            </div>

            <PageTitle title="Income" />

            {isIncomeLoading || !income ? (
                <div className="flex justify-center mt-10">
                    <TextLoader text="Loading Income..." />
                </div>
            ) : (
                <DataTable columns={columns} data={income} />
            )}
        </div>
    )
}
