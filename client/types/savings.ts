export type Savings = {
    id: number
    goal_name: string
    target_amount: number
    current_amount: number
    start_date: string
    target_date: string
}

export type SavingsCreate = {
    goal_name: string
    target_amount: number
    current_amount: number
    start_date: string
    target_date: string
}


export type SavingsEdit = {
    id: number
    goal_name: string
    target_amount: number
    current_amount: number
    start_date: string
    target_date: string
}
