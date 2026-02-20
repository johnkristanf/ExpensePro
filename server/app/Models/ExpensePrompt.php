<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpensePrompt extends Model
{
    protected $fillable = ['user_id', 'prompt_text'];
}
