<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BudgetsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\ExpensesController;
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

    Route::get('/savings', [SavingsController::class, 'index']);
    Route::post('/savings', [SavingsController::class, 'store']);
    Route::patch('/savings/{id}', [SavingsController::class, 'update']);

    Route::get('/budgets', [BudgetsController::class, 'index']);
    Route::post('/budgets', [BudgetsController::class, 'store']);
    Route::patch('/budgets/{id}', [BudgetsController::class, 'update']);

    Route::get('/income', [IncomeController::class, 'index']);
    Route::get('/income/{month}', [IncomeController::class, 'getMonthlyIncome']);
    Route::get('/income/source/{month}', [IncomeController::class, 'getIncomePerSource']);
    Route::post('/income', [IncomeController::class, 'store']);

    Route::get('/debug-sentry', function () {
        throw new Exception('My first Sentry error!');
    });

    Route::get('/test-slow', function () {
        sleep(2); // simulate slow request
        return "Done";
    });
});
