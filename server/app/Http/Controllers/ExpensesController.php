<?php

namespace App\Http\Controllers;

use App\Models\Budgets;
use App\Models\Expenses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ExpensesController extends Controller
{
    public function index()
    {
        $expenses = Expenses::with('categories')->get();
        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'budget_id' => 'required|exists:budgets,id',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'spending_type' => 'required|in:WANTS,NEEDS',
            'date' => 'required|date',
        ]);

        Log::info("EXPENSES DATA: ", [
            'validated' => $validated
        ]);


        // Step 1: Fetch the Budget
        $budget = Budgets::find($validated['budget_id']);

        if (!$budget) {
            return response()->json(['error' => 'Budget not found.'], 404);
        }

        // Step 2: Deduct the expense from the budget's current_amount
        $budget->current_amount -= $validated['amount'];

        if ($budget->current_amount < 0) {
            return response()->json(['error' => 'Insufficient budget.'], 422);
        }

        $budget->save();

        // Step 3: Create the expense (with the budget_id still linked)
        $expense = Expenses::create([
            'category_id' => $validated['category_id'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'spending_type' => $validated['spending_type'],
            'date' => $validated['date'],
        ]);

        return response()->json([
            'message' => 'Expense created successfully',
            'data' => $expense,
        ], 201);
    }
}
