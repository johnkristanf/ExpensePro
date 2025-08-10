<?php

namespace App\Http\Controllers;

use App\Helpers\MonthUtils;
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
            'category_id' => 'required',
            'budget_id' => 'required',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'spending_type' => 'required',
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

        if ($budget->current_amount <= 0) {
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


    public function getMonthlyExpenses(string $month)
    {

        $monthMap = MonthUtils::LoadMonthMap();

        if (empty($month)) {
            return response()->json([
                'error' => 'Invalid month name provided.',
            ], 400);
        }

        if ($month === 'all') {
            $total = Expenses::sum('amount');
        }

        if (array_key_exists($month, $monthMap)) {
            // Optional: Default to current year if not passed separately
            $year = now()->year;

            $total = Expenses::whereMonth('date', $monthMap[$month])
                ->whereYear('date', $year)
                ->sum('amount');
        }

        return response()->json([
            'total' => $total,
        ]);
    }


    public function getExpensesPerCategory(string $month)
    {

        $monthMap = MonthUtils::LoadMonthMap();
        $query = Expenses::with('categories:id,name');

        if (empty($month)) {
            return response()->json([
                'error' => 'Invalid month name provided.',
            ], 400);
        }

        if ($month !== 'all') {
            $monthNumber = $monthMap[$month];
            $year = now()->year;

            $query->whereMonth('date', $monthNumber)
                ->whereYear('date', $year);
        }

        $results = $query->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->categories->name ?? 'Unknown',
                    'amount' => $item->total,
                ];
            });

        return response()->json($results);
    }
}
