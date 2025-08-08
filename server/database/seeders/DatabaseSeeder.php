<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $userFullName = config('app.user_full_name');
        $userEmail = config('app.user_email');
        $userPassword = config('app.user_password');

        User::updateOrCreate(
            ['email' =>  $userEmail],
            [
                'name' => $userFullName,
                'password' => Hash::make($userPassword),
            ]
        );
    }
}
