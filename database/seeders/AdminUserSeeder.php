<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@huru.app'],
            [
                'name' => 'HURU Admin',
                'email' => 'admin@huru.app',
                'password' => Hash::make('Admin1234!'),
                'username' => 'huruadmin',
                'onboarding_completed' => true,
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
