<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            GenreSeeder::class,
            LanguageSeeder::class,
        ]);

        User::query()->updateOrCreate(
            ['email' => 'admin@asrofilio.test'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'user@asrofilio.test'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => UserRole::User,
                'email_verified_at' => now(),
            ],
        );

        $this->call(PopularBooksSeeder::class);
    }
}
