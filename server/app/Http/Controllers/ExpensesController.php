<?php

namespace App\Http\Controllers;

use App\Helpers\MonthUtils;
use App\Models\Budgets;
use App\Models\Expenses;
use App\Services\ExpensesService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpensesController extends Controller
{
    public function __construct(protected ExpensesService $expensesService){}

    public function index()
    {
        $expenses = Expenses::with(['budgets:id,name', 'categories'])
            ->orderBy('date_spent', 'desc')
            ->get();

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
            'date_spent' => 'required|date',
        ]);

        $expense = DB::transaction(function () use ($validated) {
            // Create expense
            $expense = $this->expensesService->createAndLoadExpense($validated);

            // Deduct selected budget
            $this->expensesService->deductBudget($validated['budget_id'], $validated['amount']);

            return $expense;
        });

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
