import { Budgets } from "./budgets"
import { Categories } from "./categories"

export type Expenses = {
  id: number
  description: string | null
  amount: number
  spending_type: string
  date_spent: string 
  category_id: number
  created_at: string 

  // Relationed data
  categories: Categories
  budgets: Budgets
}

export type ExpenseCreate = {
  description: string | null
  amount: number
  spending_type: string
  date: string // Date in ISO format (e.g. "2025-07-20")
  category_id: number
}

