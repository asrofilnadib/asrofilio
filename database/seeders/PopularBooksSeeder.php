<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Genre;
use App\Models\Language;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class PopularBooksSeeder extends Seeder
{
    /**
     * @var array<string, string>
     */
    private array $genreSlugAliases = [
        'mystery-thriller' => 'mysterythriller',
        'mysterythriller' => 'mystery-thriller',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@asrofilio.test')->first();

        if ($admin === null) {
            $this->command?->warn('Admin user not found. Skipping popular books seed.');

            return;
        }

        /** @var list<array<string, mixed>> $books */
        $books = require database_path('data/popular-books.php');
        $languages = Language::query()->pluck('id', 'code');
        $genres = $this->resolveGenres();

        $created = 0;
        $updated = 0;

        foreach ($books as $entry) {
            $languageId = $languages->get($entry['language'] ?? 'en');
            $attributes = [
                'title' => $entry['title'],
                'author' => $entry['author'],
                'description' => $entry['description'] ?? null,
                'page_count' => $entry['page_count'] ?? null,
                'language_id' => $languageId,
                'is_public' => true,
                'file_path' => null,
                'file_type' => null,
                'open_library_key' => $entry['open_library_key'] ?? null,
                'google_books_id' => $entry['google_books_id'] ?? null,
                'metadata' => $entry['metadata'] ?? null,
                'created_by' => $admin->id,
            ];

            $book = isset($entry['isbn']) && $entry['isbn'] !== ''
                ? Book::query()->updateOrCreate(['isbn' => $entry['isbn']], $attributes)
                : Book::query()->updateOrCreate(
                    ['title' => $entry['title'], 'author' => $entry['author']],
                    $attributes,
                );

            if ($book->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }

            $genreIds = $this->resolveGenreIds($genres, $entry['genres'] ?? []);
            $book->genres()->sync($genreIds);
        }

        $this->command?->info(sprintf(
            'Seeded %d public books (%d new, %d updated).',
            count($books),
            $created,
            $updated,
        ));
    }

    /**
     * @return Collection<string, int>
     */
    private function resolveGenres(): Collection
    {
        return Genre::query()
            ->get(['id', 'slug', 'name'])
            ->flatMap(fn (Genre $genre): array => [
                $genre->slug => $genre->id,
                strtolower(str_replace(['-', '/'], '', $genre->slug)) => $genre->id,
            ]);
    }

    /**
     * @param  Collection<string, int>  $genres
     * @param  list<string>  $slugs
     * @return list<int>
     */
    private function resolveGenreIds(Collection $genres, array $slugs): array
    {
        $ids = [];

        foreach ($slugs as $slug) {
            $id = $genres->get($slug)
                ?? $genres->get($this->genreSlugAliases[$slug] ?? '')
                ?? $genres->get(strtolower(str_replace(['-', '/'], '', $slug)));

            if ($id !== null) {
                $ids[] = $id;
            }
        }

        return array_values(array_unique($ids));
    }
}
