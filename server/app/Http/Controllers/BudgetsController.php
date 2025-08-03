<?php

namespace App\Http\Controllers;

use App\Models\Budgets;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class BudgetsController extends Controller
{
    public function index(Request $request)
    {
        $query = Budgets::query();

        if ($request->has('component')) {
            $component = $request->component;

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


    public function update(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'total_amount' => 'required|numeric|min:0',
                'budget_period' => 'required|date',
            ]);

            $updated = Budgets::where('id', $id)->update([
                'name' => $validated['name'],
                'current_amount' => $validated['total_amount'],
                'total_amount' => $validated['total_amount'],
                'budget_period' => $validated['budget_period'],
            ]);

            if ($updated === 0) {
                return response()->json(['error' => 'Budget not found or not updated.'], 404);
            }

            return response()->json([
                'message' => 'Budget edited successfully.',
            ]);
        } catch (ValidationException $e) {
            // Log validation errors
            Log::error("Validation failed", [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'error' => 'Input Field Validation Error',
            ], 422);
        } catch (Exception $e) {
            // Log other exceptions
            Log::error("Failed to edit budget ", [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Server error. Failed to edit budget.',
            ], 500);
        }
    }
}
