<?php

namespace App\Http\Controllers;

use App\Models\Savings;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            'current_amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'target_date' => 'required|date|after_or_equal:start_date',
        ]);

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
                'current_amount' => 'required|numeric|min:0',
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
}
