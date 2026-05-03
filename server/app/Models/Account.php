<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    protected $guarded = ['id'];

    public function adjustmentLogs(): HasMany
    {
        return $this->hasMany(AdjustmentLog::class);
    }
}
