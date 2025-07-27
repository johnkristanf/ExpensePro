export type Budgets = {
    id: number
    name: string
    current_amount: number
    total_amount: number
    budget_period: string
}

export type BudgetCreate = {
    name: string
    total_amount: number
    budget_period: string
}
