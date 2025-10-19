import { SpendingType } from '@/enums/expenses'
import { FieldInputType, InputType } from '@/enums/form'
import { Budgets } from '@/types/budgets'
import { Categories } from '@/types/categories'
import { Expenses } from '@/types/expenses'
import { FieldSchema } from '@/types/form'

export const budgetToFieldSchemas = (budget: Budgets): FieldSchema[] => {
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

export const expensesToFieldSchemas = (
    expense: Expenses,
    categories: Categories[],
    budgets: Budgets[]
): FieldSchema[] => {
    const modifiedFields: FieldSchema[] = [
        {
            name: 'category_id',
            label: 'Category',
            type: InputType.SELECT,
            defaultValue: expense.categories.id.toString(),
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
            defaultValue: expense.budgets.id.toString(),
            options:
                budgets &&
                budgets.map((bud) => ({
                    label: bud.name,
                    value: bud.id.toString(),
                })),
        },

        {
            name: 'description',
            label: 'Description',
            type: InputType.INPUT,
            inputType: FieldInputType.TEXT,
            defaultValue: expense.description,
        },

        {
            name: 'amount',
            label: 'Amount',
            type: InputType.INPUT,
            inputType: FieldInputType.NUMBER,
            defaultValue: expense.amount,
        },

        {
            name: 'spending_type',
            label: 'Spending Type',
            type: InputType.SELECT,
            defaultValue: expense.spending_type,
            placeholder: expense.spending_type,
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
            defaultValue: expense.date_spent,
        },
    ]

    return modifiedFields
}
