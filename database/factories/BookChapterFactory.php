<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\BookChapter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookChapter>
 */
class BookChapterFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'book_id' => Book::factory(),
            'title' => fake()->sentence(3),
            'href' => fake()->optional()->slug(),
            'order' => fake()->numberBetween(1, 50),
            'level' => fake()->numberBetween(0, 2),
        ];
    }
}
