<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Quote>
 */
class QuoteFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'text' => fake()->paragraph(),
            'attribution' => fake()->optional()->name(),
            'is_public' => fake()->boolean(20),
        ];
    }
}
