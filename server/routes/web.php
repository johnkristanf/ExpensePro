<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/clear-cache', function () {
    Artisan::call('cache:clear');
    Artisan::call('route:cache');
    Artisan::call('view:clear');
    Artisan::call('config:clear');

    return 'Laravel Cache Cleared Successfully';
});

Route::get('/debug-sentry', function () {
    throw new Exception('My first Sentry error!');
});

Route::post('/login', [AuthController::class, 'login']);