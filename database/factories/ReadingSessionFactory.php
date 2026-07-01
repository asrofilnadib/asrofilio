<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\ReadingSession;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReadingSession>
 */
class ReadingSessionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = fake()->dateTimeBetween('-1 month', 'now');
        $endedAt = fake()->dateTimeBetween($startedAt, 'now');

        return [
            'user_id' => User::factory(),
            'user_book_id' => UserBook::factory(),
            'book_id' => Book::factory(),
            'started_at' => $startedAt,
            'ended_at' => $endedAt,
            'duration_seconds' => fake()->numberBetween(300, 7200),
            'start_page' => fake()->numberBetween(1, 100),
            'end_page' => fake()->numberBetween(101, 200),
            'pages_read' => fake()->numberBetween(5, 50),
        ];
    }
}
