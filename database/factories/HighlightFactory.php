<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Highlight;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Highlight>
 */
class HighlightFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'user_book_id' => UserBook::factory(),
            'text' => fake()->sentence(),
            'cfi_start' => '/6/4[chap01ref]!/4/2/1:0',
            'cfi_end' => '/6/4[chap01ref]!/4/2/1:42',
            'color' => fake()->randomElement(['yellow', 'green', 'blue', 'pink']),
            'chapter_title' => fake()->optional()->sentence(2),
        ];
    }
}
