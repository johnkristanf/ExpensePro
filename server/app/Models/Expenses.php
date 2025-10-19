<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expenses extends Model
{
    protected $guarded = [
        'id',
    ];


    public function budgets(): BelongsTo
    {
        return $this->belongsTo(Budgets::class, 'budget_id');
    }

    public function categories(): BelongsTo
    {
        return $this->belongsTo(Categories::class, 'category_id');
    }
}
