<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categories extends Model
{
    protected $guarded = [
        'id'
    ];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expenses::class, 'category_id');
    }
}
