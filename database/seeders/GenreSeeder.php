<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GenreSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    private array $genres = [
        'Fiction',
        'Non-Fiction',
        'Science',
        'History',
        'Biography',
        'Philosophy',
        'Fantasy',
        'Mystery/Thriller',
        'Romance',
        'Comedy',
        'Horror',
        'Other',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->genres as $index => $name) {
            Genre::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }
}
