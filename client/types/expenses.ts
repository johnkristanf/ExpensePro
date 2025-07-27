import { Categories } from "./categories"

export type Expenses = {
  id: number
  description: string | null
  amount: number
  spending_type: string
  date: string // Date in ISO format (e.g. "2025-07-20")
  category_id: number
  categories: Categories
  created_at: string // Timestamp (e.g. "2025-07-20T15:32:10.000000Z")
}

export type ExpenseCreate = {
  description: string | null
  amount: number
  spending_type: string
  date: string // Date in ISO format (e.g. "2025-07-20")
  category_id: number
}

