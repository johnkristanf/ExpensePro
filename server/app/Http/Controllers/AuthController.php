<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Login Failed',
                'error_code' => 'AUTHENTICATION_FAILED',
            ]);
        }

        $request->session()->regenerate();
        return response()->json([
            'success' => true,
            'message' => 'Login successfully.',
        ], 201);
    }
}
