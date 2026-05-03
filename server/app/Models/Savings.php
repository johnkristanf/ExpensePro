<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Savings extends Model
{
    protected $guarded = ['id'];

    public function adjustmentLogs(): MorphMany
    {
        return $this->morphMany(AdjustmentLog::class, 'loggable');
    }
}
