<?php

namespace App\Http\Controllers;

use App\Models\Budgets;
use App\Models\Account;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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
            'current_amount' => 0, // Default to 0, use adjustments to add funds
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

    public function adjustBalance(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'type' => 'required|in:increment,decrement',
                'account_id' => 'required_if:type,increment|exists:accounts,id',
                'reason' => 'required_if:type,decrement|string|max:255',
            ]);

            $budget = Budgets::findOrFail($id);
            $amount = $validated['amount'];
            $type = $validated['type'];

            DB::beginTransaction();

            if ($type === 'decrement') {
                if ($budget->current_amount - $amount < 0) {
                     return response()->json([
                        'message' => 'Insufficient budget balance for this deduction.',
                    ], 400);
                }
                $budget->decrement('current_amount', $amount);

                $budget->adjustmentLogs()->create([
                    'user_id' => auth()->id(),
                    'type' => 'decrement',
                    'amount' => $amount,
                    'reason' => $validated['reason'] ?? null,
                ]);
            } else {
                $account = Account::where('id', $validated['account_id'])->where('user_id', auth()->id())->firstOrFail();
                if ($account->balance - $amount < 0) {
                    return response()->json([
                        'message' => 'Insufficient account balance for this addition.',
                    ], 400);
                }
                
                $account->decrement('balance', $amount);
                $budget->increment('current_amount', $amount);

                $budget->adjustmentLogs()->create([
                    'user_id' => auth()->id(),
                    'type' => 'increment',
                    'amount' => $amount,
                    'account_id' => $account->id,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Budget adjusted successfully.',
                'data' => $budget->fresh(),
            ]);

        } catch (ValidationException $e) {
             DB::rollBack();
             return response()->json([
                'error' => 'Validation Error',
                'messages' => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Failed to adjust budget balance", [
                'error' => $e->getMessage(),
                'budget_id' => $id
            ]);

            return response()->json([
                'error' => 'Server error. Failed to adjust budget.',
            ], 500);
        }
    }
}
