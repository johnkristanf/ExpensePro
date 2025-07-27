export type Categories = {
    id: number
    name: string
    notes: string
    created_at: string
    updated_at: string
}

export type CategoriesCreate = {
    name: string
    notes: string
}
