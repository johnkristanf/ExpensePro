<?php

use App\Http\Controllers\BudgetsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\ExpensesController;
use App\Http\Controllers\SavingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/categories', [CategoriesController::class, 'index']);
Route::post('/categories', [CategoriesController::class, 'store']);

Route::get('/expenses', [ExpensesController::class, 'index']);
Route::post('/expenses', [ExpensesController::class, 'store']);

Route::get('/savings', [SavingsController::class, 'index']);
Route::post('/savings', [SavingsController::class, 'store']);

Route::get('/budgets', [BudgetsController::class, 'index']);
Route::post('/budgets', [BudgetsController::class, 'store']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
