<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Note;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
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
            'content' => fake()->paragraph(),
            'cfi_location' => fake()->optional()->regexify('/6/[0-9]+\\[.*\\]!/4/[0-9]+/[0-9]+:[0-9]+'),
            'chapter_title' => fake()->optional()->sentence(2),
        ];
    }
}
