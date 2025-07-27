<?php

namespace App\Http\Controllers;

use App\Models\Savings;
use Illuminate\Http\Request;

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
}
