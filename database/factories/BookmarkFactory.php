<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Bookmark;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bookmark>
 */
class BookmarkFactory extends Factory
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
            'cfi_location' => '/6/4[chap01ref]!/4/2/1:0',
            'label' => fake()->optional()->words(3, true),
            'chapter_title' => fake()->optional()->sentence(2),
        ];
    }
}
