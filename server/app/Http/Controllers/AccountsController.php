<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AccountsController extends Controller
{
    public function index(Request $request)
    {
        $accounts = Account::where('user_id', $request->user()->id)
            ->select('id', 'name', 'type', 'balance')
            ->latest()
            ->get();

        return response()->json($accounts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'balance' => 'required|numeric',
        ]);

        $validated['user_id'] = $request->user()->id;

        $account = Account::create($validated);

        return response()->json([
            'message' => 'Account Created Successfully.',
            'data' => $account,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'balance' => 'required|numeric',
            ]);

            $account = Account::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $account->update($validated);

            return response()->json(['message' => 'Account updated successfully']);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Input Field Validation Error',
                'messages' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error("Failed to edit account", [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Server error. Failed to edit account.',
            ], 500);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $account = Account::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$account) {
            return response()->json([
                'message' => 'Account not found',
            ], 404);
        }

        $account->delete();

        return response()->json([
            'message' => 'Account deleted successfully',
        ], 200);
    }

    public function adjustBalance(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'type' => 'required|in:increment,decrement',
            ]);

            $account = Account::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $amount = $validated['amount'];
            $type = $validated['type'];

            if ($type === 'decrement') {
                if ($account->balance - $amount < 0) {
                     return response()->json([
                        'message' => 'Insufficient account balance for this deduction.',
                    ], 400);
                }
                $account->decrement('balance', $amount);
            } else {
                $account->increment('balance', $amount);
            }

            return response()->json([
                'message' => 'Account balance adjusted successfully.',
                'data' => $account->fresh(),
            ]);

        } catch (ValidationException $e) {
             return response()->json([
                'error' => 'Validation Error',
                'messages' => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            Log::error("Failed to adjust account balance", [
                'error' => $e->getMessage(),
                'account_id' => $id
            ]);

            return response()->json([
                'error' => 'Server error. Failed to adjust account balance.',
            ], 500);
        }
    }
}
