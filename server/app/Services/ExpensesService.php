<?php
namespace App\Services;

use App\Models\Budgets;
use App\Models\Expenses;
use Exception;
use Illuminate\Support\Facades\Log;

class ExpensesService {
    public function deductBudget($budgetID, $amount)
    {
        $budget = Budgets::find($budgetID);
        if (!$budget) {
            throw new Exception('Budget not found.');
        }

        // Calculate potential new current_amount
        $newCurrentAmount = $budget->current_amount - $amount;
        if ($newCurrentAmount < 0) {
            throw new Exception('Insufficient budget. Available: ' . intval($budget->current_amount));
        }

        // Save the updated current_amount to the database
        $budget->current_amount = $newCurrentAmount;
        $budget->save();

        return $budget;
    }


    public function createAndLoadExpense($data)
    {
        return Expenses::create([
            'category_id' => $data['category_id'],
            'budget_id' => $data['budget_id'],

            'description' => $data['description'],
            'amount' => $data['amount'],
            'spending_type' => $data['spending_type'],
            'date_spent' => $data['date_spent'],
        ]);
    }
}