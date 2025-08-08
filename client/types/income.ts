export type Income = {
    id: number
    source: string
    amount: number
    date_acquired: string
    created_at: string
}


export type IncomeCreate = {
    source: string
    amount: number
    date_acquired: string
}

