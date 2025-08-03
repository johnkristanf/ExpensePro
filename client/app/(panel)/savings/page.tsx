'use client'

import PageTitle from '@/components/page-title'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { Progress } from '@/components/ui/progress'
import { Pencil, Trash } from 'lucide-react'
import { formatAmount, formatNumericDateToWordDate } from '@/lib/utils'
import FormDialog from '@/components/create-form-dialog'
import { FieldInputType, InputType } from '@/enums/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createSavings } from '@/lib/api/savings/post'
import { Savings, SavingsCreate, SavingsEdit } from '@/types/savings'
import { fetchSavings } from '@/lib/api/savings/get'
import TextLoader from '@/components/text-loader'
import { FieldSchema } from '@/types/form'
import EditFormDialog from '@/components/edit-form-dialog'
import { editSavings } from '@/lib/api/savings/patch'

export default function SavingsPage() {
    const queryClient = useQueryClient()

    // FETCH SAVINGS
    const { data: savings, isLoading: isSavingsLoading } = useQuery({
        queryKey: ['savings'],
        queryFn: fetchSavings,
    })

    // CREATE SAVINGS MUTATION
    const mutation = useMutation({
        mutationFn: createSavings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savings'] })
            toast.success('Savings Created Successfully')
        },

        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleCreateSavings = (data: SavingsCreate) => {
        mutation.mutate(data)
    }

    // EDIT SAVINGS MUTATION
    const editMutation = useMutation({
        mutationFn: editSavings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savings'] })
            toast.success('Savings Edited Successfully')
        },

        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleEditSaving = (data: SavingsEdit) => {
        editMutation.mutate(data)
    }

    // MAPPED SAVINGS DATA FROM DB TO THE DYNAMIC DIALOG FIELDS
    const savingsToFieldSchemas = (saving: Savings): FieldSchema[] => {
        const modifiedFields = [
            {
                name: 'goal_name',
                label: 'Savings Goal',
                type: InputType.INPUT,
                inputType: 'text',
                placeholder: 'Enter Goal',
                defaultValue: saving.goal_name,
            },
            {
                name: 'current_amount',
                label: 'Current Amount',
                type: InputType.INPUT,
                inputType: 'number',
                placeholder: 'Enter current amount',
                defaultValue: saving.current_amount,
            },
            {
                name: 'target_amount',
                label: 'Target Amount',
                type: InputType.INPUT,
                inputType: 'number',
                placeholder: 'Enter target amount',
                defaultValue: saving.target_amount,
            },

            {
                name: 'start_date',
                label: 'Start Date',
                type: InputType.INPUT,
                inputType: 'date',
                placeholder: 'Enter start date ',
                defaultValue: saving.start_date,
            },

            {
                name: 'target_date',
                label: 'Target Date',
                type: InputType.INPUT,
                inputType: 'date',
                placeholder: 'Enter target date ',
                defaultValue: saving.target_date,
            },
        ]

        return modifiedFields
    }
    return (
        <div className="container mx-auto py-5">
            <PageTitle title="Savings" />

            {/* CREATE SAVINGS FORM BUTTON TRIGGER */}
            <div className="flex justify-end">
                <FormDialog
                    triggerLabel="Create Saving"
                    title="New Savings"
                    onSubmit={(data) => handleCreateSavings(data)}
                    fields={[
                        {
                            name: 'goal_name',
                            label: 'Goal',
                            type: InputType.INPUT,
                            inputType: FieldInputType.TEXT,
                            placeholder: 'e.g. Emergency Fund, Laptop',
                        },

                        {
                            name: 'current_amount',
                            label: 'Current Amount',
                            type: InputType.INPUT,
                            inputType: FieldInputType.NUMBER,
                        },

                        {
                            name: 'target_amount',
                            label: 'Target Amount',
                            type: InputType.INPUT,
                            inputType: FieldInputType.NUMBER,
                        },

                        {
                            name: 'start_date',
                            label: 'Start Date',
                            type: InputType.INPUT,
                            inputType: FieldInputType.DATE,
                        },

                        {
                            name: 'target_date',
                            label: 'Target Date',
                            type: InputType.INPUT,
                            inputType: FieldInputType.DATE,
                        },
                    ]}
                />
            </div>

            {/* SAVINGS LOADER */}
            {isSavingsLoading && (
                <div className="flex justify-center mt-10">
                    <TextLoader text="Loading Savings..." />
                </div>
            )}

            {savings && savings.length === 0 ? (
                <div className="text-center mt-10 text-muted-foreground text-md">
                    No savings found.
                </div>
            ) : null}

            {/* SAVINGS DATA CARD */}
            <div className="h-[70vh] grid md:grid-cols-2 gap-5 mt-5 overflow-y-scroll">
                {/* SAVINGS CARD */}
                {savings &&
                    savings.length > 0 &&
                    savings.map((saving) => (
                        <Card key={saving.id} className="w-full md:max-w-md md:max-h-44">
                            <CardHeader>
                                <CardTitle>{saving.goal_name}</CardTitle>

                                <div className="flex flex-col gap-1 text-sm mt-1">
                                    <h1>
                                        Start Date: {formatNumericDateToWordDate(saving.start_date)}
                                    </h1>
                                    <h1>
                                        Target Date:{' '}
                                        {formatNumericDateToWordDate(saving.target_date)}
                                    </h1>
                                </div>

                                <CardAction>
                                    <div className="flex gap-1 items-center">
                                        <EditFormDialog
                                            title="Edit Savings"
                                            fields={savingsToFieldSchemas(saving)}
                                            onSubmit={(data) =>
                                                handleEditSaving({ id: saving.id, ...data })
                                            }
                                        />
                                        <Trash className="size-4 text-red-800" />
                                    </div>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between">
                                    <h1>₱0</h1>
                                    <h1>₱{formatAmount(saving.target_amount)}</h1>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Progress
                                            value={
                                                (saving.current_amount / saving.target_amount) * 100
                                            }
                                            className="hover:cursor-pointer hover:opacity-75"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="flex flex-col">
                                            <h1>
                                                Current Amount: ₱
                                                {formatAmount(saving.current_amount)}
                                            </h1>
                                            <h1>
                                                Target Amount: ₱{formatAmount(saving.target_amount)}
                                            </h1>
                                            <h1>
                                                Amount Left to Save: ₱
                                                {formatAmount(
                                                    Math.round(
                                                        saving.target_amount - saving.current_amount
                                                    )
                                                )}
                                            </h1>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    )
}
