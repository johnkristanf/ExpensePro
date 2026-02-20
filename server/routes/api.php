<?php

use App\Http\Controllers\BudgetsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\ExpensesController;
use App\Http\Controllers\ExpensePromptController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\SavingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/categories', [CategoriesController::class, 'index']);
    Route::post('/categories', [CategoriesController::class, 'store']);

    Route::get('/expenses', [ExpensesController::class, 'index']);
    Route::get('/expenses/{month}', [ExpensesController::class, 'getMonthlyExpenses']);
    Route::get('/expenses/category/{month}', [ExpensesController::class, 'getExpensesPerCategory']);
    Route::post('/expenses', [ExpensesController::class, 'store']);
    Route::delete('/expenses/{id}', [ExpensesController::class, 'destroy']);

    Route::get('/savings', [SavingsController::class, 'index']);
    Route::post('/savings', [SavingsController::class, 'store']);
    Route::patch('/savings/{id}', [SavingsController::class, 'update']);
    Route::patch('/savings/{id}/adjust', [SavingsController::class, 'adjustBalance']);

    Route::get('/budgets', [BudgetsController::class, 'index']);
    Route::post('/budgets', [BudgetsController::class, 'store']);
    Route::patch('/budgets/{id}', [BudgetsController::class, 'update']);
    Route::patch('/budgets/{id}/adjust', [BudgetsController::class, 'adjustBalance']);

    Route::get('/income', [IncomeController::class, 'index']);
    Route::get('/income/{month}', [IncomeController::class, 'getMonthlyIncome']);
    Route::get('/income/source/{month}', [IncomeController::class, 'getIncomePerSource']);
    Route::post('/income', [IncomeController::class, 'store']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/expense-prompts', [ExpensePromptController::class, 'index']);
    Route::post('/expense-prompts', [ExpensePromptController::class, 'store']);
    Route::patch('/expense-prompts/{id}', [ExpensePromptController::class, 'update']);
    Route::delete('/expense-prompts/{id}', [ExpensePromptController::class, 'destroy']);

});
