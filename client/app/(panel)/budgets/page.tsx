'use client'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import FormDialog from '@/components/create-form-dialog'
import PageTitle from '@/components/page-title'
import { FieldInputType, InputType } from '@/enums/form'
import { fetchBudgets } from '@/lib/api/budgets/get'
import { createBudget } from '@/lib/api/budgets/post'
import { formatAmount, formatNumericDateToWordDate } from '@/lib/utils'
import { BudgetCreate, BudgetEdit, Budgets } from '@/types/budgets'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Trash } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { BudgetFetchComponent } from '@/enums/budgets'
import TextLoader from '@/components/text-loader'
import { FieldSchema } from '@/types/form'
import EditFormDialog from '@/components/edit-form-dialog'
import { editBudget } from '@/lib/api/budgets/patch'

export default function BudgetsPage() {
    const queryClient = useQueryClient()

    // FETCH BUDGETS
    const { data: budgets, isLoading: isBudgetsLoading } = useQuery({
        queryKey: ['budgets'],
        queryFn: async () => {
            return await fetchBudgets(BudgetFetchComponent.CARD)
        },
    })

    // CREATE BUDGET MUTATION
    const createMutation = useMutation({
        mutationFn: createBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] })
            toast.success('Budget Added Successfully')
        },

        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleCreateBudget = (data: BudgetCreate) => {
        createMutation.mutate(data)
    }

    // EDIT BUDGET MUTATION
    const editMutation = useMutation({
        mutationFn: editBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] })
            toast.success('Budget Edited Successfully')
        },

        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleEditBudget = (data: BudgetEdit) => {
        editMutation.mutate(data)
    }

    // MAPPED BUDGETS DATA FROM DB TO THE DYNAMIC DIALOG FIELDS
    const budgetToFieldSchemas = (budget: Budgets): FieldSchema[] => {
        const modifiedFields = [
            {
                name: 'name',
                label: 'Budget Name',
                type: InputType.INPUT,
                inputType: 'text',
                placeholder: 'Enter budget name',
                defaultValue: budget.name,
            },
            {
                name: 'total_amount',
                label: 'Total Amount',
                type: InputType.INPUT,

                inputType: 'number',
                placeholder: 'Enter total budget amount',
                defaultValue: budget.total_amount,
            },
            {
                name: 'budget_period',
                label: 'Budget Period',
                type: InputType.INPUT,
                inputType: 'date',
                placeholder: 'Select budget period',
                defaultValue: budget.budget_period,
            },
        ]

        return modifiedFields
    }

    return (
        <div className="container mx-auto py-5">
            <PageTitle title="Budgets" />

            {/* CREATE BUDGET FORM BUTTON TRIGGER */}
            <div className="flex justify-end">
                <FormDialog
                    triggerLabel="Create Budget"
                    title="New Budget"
                    onSubmit={(data) => handleCreateBudget(data)}
                    fields={[
                        {
                            name: 'name',
                            label: 'Budget Name',
                            type: InputType.INPUT,
                            inputType: FieldInputType.TEXT,
                            placeholder: 'e.g. July Grocery Budget',
                        },

                        {
                            name: 'total_amount',
                            label: 'Total Amount',
                            type: InputType.INPUT,
                            inputType: FieldInputType.NUMBER,
                        },

                        {
                            name: 'budget_period',
                            label: 'Budget Period',
                            type: InputType.INPUT,
                            inputType: FieldInputType.DATE,
                        },
                    ]}
                />
            </div>

            {isBudgetsLoading && (
                <div className="flex justify-center mt-10">
                    <TextLoader text="Loading Budgets..." />
                </div>
            )}

            {/* BUDGETS CARD */}
            {budgets && budgets.length > 0 ? (
                <div className="h-[70vh] grid md:grid-cols-2 gap-5 mt-5 overflow-y-scroll">
                    {budgets.map((budget) => (
                        <Card key={budget.id} className="w-full md:max-w-md md:max-h-44">
                            <CardHeader>
                                <CardTitle>{budget.name}</CardTitle>
                                <div className="flex flex-col gap-1 text-sm mt-1">
                                    <h1>
                                        Budget Period:{' '}
                                        {formatNumericDateToWordDate(budget.budget_period)}
                                    </h1>
                                </div>
                                <CardAction>
                                    <div className="flex gap-1 items-center">
                                        <EditFormDialog
                                            title="Edit Budget"
                                            fields={budgetToFieldSchemas(budget)}
                                            onSubmit={(data) =>
                                                handleEditBudget({ id: budget.id, ...data })
                                            }
                                        />
                                        <Trash className="size-4 text-red-800" />
                                    </div>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between">
                                    <h1>₱0</h1>
                                    <h1>₱{formatAmount(budget.total_amount)}</h1>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Progress
                                            value={
                                                (budget.current_amount / budget.total_amount) * 100
                                            }
                                            className="hover:cursor-pointer hover:opacity-75"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="flex flex-col">
                                            <h1>
                                                Total Budget: ₱{formatAmount(budget.total_amount)}
                                            </h1>
                                            <h1>
                                                Amount Left: ₱{formatAmount(budget.current_amount)}
                                            </h1>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : budgets && budgets.length === 0 ? (
                <div className="text-center mt-10 text-muted-foreground text-md">
                    No budgets found.
                </div>
            ) : null}
        </div>
    )
}
