<?php

namespace App\Http\Controllers;

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
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'spending_type' => 'required|in:WANTS,NEEDS',
            'date' => 'required|date',
        ]);

        Log::info("EXPENSES DATA: ", [
            'validated' => $validated
        ]);


        $category = Expenses::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }
}
