<?php

namespace Database\Factories;

use App\Enums\BookFileType;
use App\Models\Book;
use App\Models\Language;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'subtitle' => fake()->optional()->sentence(),
            'author' => fake()->name(),
            'isbn' => fake()->optional()->isbn13(),
            'description' => fake()->optional()->paragraph(),
            'page_count' => fake()->numberBetween(100, 800),
            'file_type' => fake()->randomElement(BookFileType::cases()),
            'language_id' => Language::factory(),
            'is_public' => fake()->boolean(30),
            'created_by' => User::factory(),
        ];
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }
}
