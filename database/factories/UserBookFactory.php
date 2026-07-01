<?php

namespace Database\Factories;

use App\Enums\ReadingStatus;
use App\Models\Book;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserBook>
 */
class UserBookFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'status' => fake()->randomElement(ReadingStatus::cases()),
            'current_page' => fake()->numberBetween(0, 500),
            'progress_percent' => fake()->numberBetween(0, 100),
        ];
    }
}
