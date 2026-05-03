<?php

namespace App\Http\Controllers;

use App\Models\Savings;
use App\Models\Account;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SavingsController extends Controller
{
    public function index()
    {
        $savings = Savings::select('id', 'goal_name', 'target_amount', 'current_amount', 'start_date', 'target_date') // preferred columns
            ->latest() // orders by created_at DESC by default
            ->get();

        return $savings;
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'goal_name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'current_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'target_date' => 'required|date|after_or_equal:start_date',
        ]);

        $validated['current_amount'] = $validated['current_amount'] ?? 0;

        $savings = Savings::create($validated);

        return response()->json([
            'message' => 'Savings Created Successfully.',
            'data' => $savings,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'goal_name' => 'required|string|max:255',
                'target_amount' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'target_date' => 'required|date|after_or_equal:start_date',
            ]);

            $updated = Savings::where('id', $id)->update($validated);

            if (!$updated) {
                return response()->json(['error' => 'Savings record not found or update failed'], 404);
            }

            return response()->json(['message' => 'Savings updated successfully']);
        } catch (ValidationException $e) {
            Log::error("Validation failed", [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'error' => 'Input Field Validation Error',
            ], 422);
        } catch (Exception $e) {
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

            $saving = Savings::findOrFail($id);
            $amount = $validated['amount'];
            $type = $validated['type'];

            DB::beginTransaction();

            if ($type === 'decrement') {
                if ($saving->current_amount - $amount < 0) {
                     return response()->json([
                        'message' => 'Insufficient savings balance for this deduction.',
                    ], 400);
                }
                $saving->decrement('current_amount', $amount);

                $saving->adjustmentLogs()->create([
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
                $saving->increment('current_amount', $amount);

                $saving->adjustmentLogs()->create([
                    'user_id' => auth()->id(),
                    'type' => 'increment',
                    'amount' => $amount,
                    'account_id' => $account->id,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Savings adjusted successfully.',
                'data' => $saving->fresh(),
            ]);

        } catch (ValidationException $e) {
             DB::rollBack();
             return response()->json([
                'error' => 'Validation Error',
                'messages' => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Failed to adjust savings balance", [
                'error' => $e->getMessage(),
                'saving_id' => $id
            ]);

            return response()->json([
                'error' => 'Server error. Failed to adjust savings.',
            ], 500);
        }
    }
}
