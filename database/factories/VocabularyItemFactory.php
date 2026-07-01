<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\User;
use App\Models\VocabularyItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VocabularyItem>
 */
class VocabularyItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'word' => fake()->word(),
            'definition' => fake()->optional()->sentence(),
            'context' => fake()->optional()->sentence(),
        ];
    }
}
