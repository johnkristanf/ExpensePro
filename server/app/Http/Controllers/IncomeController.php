<?php

namespace App\Http\Controllers;

use App\Helpers\MonthUtils;
use App\Models\Income;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class IncomeController extends Controller
{

    public function index()
    {
        $income = Income::select('id', 'source', 'amount', 'date_acquired', 'created_at')
            ->latest() // order by created_at DESC by default
            ->get();

        return $income;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date_acquired' => 'required|date',
        ]);

        Log::info("Income Data Validated: ", $validated);

        $income = Income::create($validated);

        return response()->json([
            'message' => 'Income record created successfully.',
            'data' => $income,
        ], 201);
    }


    public function getMonthlyIncome(string $month)
    {

        $monthMap = MonthUtils::LoadMonthMap();

        if ($month === 'all') {
            $total = Income::sum('amount');
        } elseif (array_key_exists($month, $monthMap)) {
            // Optional: Default to current year if not passed separately
            $year = now()->year;

            $total = Income::whereMonth('date_acquired', $monthMap[$month])
                ->whereYear('date_acquired', $year)
                ->sum('amount');
        } else {
            return response()->json([
                'error' => 'Invalid month name provided.',
            ], 400);
        }

        return response()->json([
            'total' => $total,
        ]);
    }



    public function getIncomePerSource(string $month)
    {
        $monthMap = MonthUtils::LoadMonthMap();

        // Start query on income table
        $query = DB::table('income');

        if ($month !== 'all') {
            if (!array_key_exists(strtolower($month), $monthMap)) {
                return response()->json([
                    'error' => 'Invalid month name provided.',
                ], 400);
            }

            $monthNum = $monthMap[$month];
            $year = now()->year;

            $query->whereMonth('date_acquired', $monthNum)
                ->whereYear('date_acquired', $year);
        }

        $results = $query->select('source', DB::raw('SUM(amount) as amount'))
            ->groupBy('source')
            ->orderBy('source')
            ->get();

        return $results; // return plain array (no 'data' key)
    }
}
