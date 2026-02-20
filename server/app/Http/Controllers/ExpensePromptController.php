<?php

namespace App\Http\Controllers;

use App\Models\ExpensePrompt;
use Illuminate\Http\Request;

class ExpensePromptController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->expensePrompts()->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'prompt_text' => 'required|string|max:1000',
        ]);

        return $request->user()->expensePrompts()->create([
            'prompt_text' => $request->prompt_text,
        ]);
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            'prompt_text' => 'required|string|max:1000',
        ]);

        $prompt = $request->user()->expensePrompts()->findOrFail($id);
        $prompt->update([
            'prompt_text' => $request->prompt_text,
        ]);

        return $prompt;
    }

    public function destroy(Request $request, $id)
    {
        $prompt = $request->user()->expensePrompts()->findOrFail($id);
        $prompt->delete();
        return response()->noContent();
    }
}
