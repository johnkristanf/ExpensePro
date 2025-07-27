<?php

namespace App\Http\Controllers;

use App\Models\Budgets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BudgetsController extends Controller
{
    public function index(Request $request)
    {
        $query = Budgets::query();

        if ($request->has('component')) {
            $component = $request->component;

            Log::info("Component: ", [
                'component' => $component
            ]);

            if ($component === 'card') {
                $query->select('id', 'name', 'current_amount', 'total_amount', 'budget_period');
            }

            if ($component === 'dropdown') {
                $query->select('id', 'name');
            }
        }

        $budgets = $query->latest()->get();
        return $budgets;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'budget_period' => 'required|date',
        ]);

        $budget = Budgets::create([
            'name' => $validated['name'],
            'current_amount' => $validated['total_amount'], // initial current_amount upon budget creation
            'total_amount' => $validated['total_amount'],
            'budget_period' => $validated['budget_period'],
        ]);

        return response()->json([
            'message' => 'Budget Created Successfully.',
            'data' => $budget
        ], 201);
    }
}
