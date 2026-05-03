<?php

namespace App\Http\Controllers;

use App\Models\AdjustmentLog;
use Illuminate\Http\Request;

class AdjustmentLogsController extends Controller
{
    public function index(Request $request, $domain, $id)
    {
        $loggableType = $domain === 'budgets' ? 'App\Models\Budgets' : ($domain === 'savings' ? 'App\Models\Savings' : null);

        if (!$loggableType) {
            return response()->json(['error' => 'Invalid domain'], 400);
        }

        $logs = AdjustmentLog::with('account')
            ->where('loggable_type', $loggableType)
            ->where('loggable_id', $id)
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return response()->json($logs);
    }
}
