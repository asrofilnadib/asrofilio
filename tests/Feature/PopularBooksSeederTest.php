<?php

use App\Enums\UserRole;
use App\Models\Book;
use App\Models\Language;
use App\Models\User;
use Database\Seeders\GenreSeeder;
use Database\Seeders\LanguageSeeder;
use Database\Seeders\PopularBooksSeeder;
use Illuminate\Support\Facades\Hash;

function seedPopularBooksDependencies(): void
{
    (new GenreSeeder)->run();
    (new LanguageSeeder)->run();

    User::query()->updateOrCreate(
        ['email' => 'admin@asrofilio.test'],
        [
            'name' => 'Admin User',
            'password' => Hash::make('password'),
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ],
    );
}

test('popular books seeder creates 65 public catalog books', function () {
    seedPopularBooksDependencies();

    (new PopularBooksSeeder)->run();

    expect(Book::query()->where('is_public', true)->count())->toBe(65);
    expect(Book::query()->whereNotNull('file_path')->count())->toBe(0);
});

test('popular books seeder attaches genres and mixed languages', function () {
    seedPopularBooksDependencies();

    (new PopularBooksSeeder)->run();

    $indonesianId = Language::query()->where('code', 'id')->value('id');
    $englishId = Language::query()->where('code', 'en')->value('id');

    expect(Book::query()->where('language_id', $indonesianId)->count())->toBeGreaterThan(20);
    expect(Book::query()->where('language_id', $englishId)->count())->toBeGreaterThan(30);
    expect(Book::query()->doesntHave('genres')->count())->toBe(0);
    expect(Book::query()->has('genres', '>', 1)->count())->toBeGreaterThan(10);
});

test('popular books seeder is idempotent', function () {
    seedPopularBooksDependencies();

    (new PopularBooksSeeder)->run();
    (new PopularBooksSeeder)->run();

    expect(Book::query()->where('is_public', true)->count())->toBe(65);
    expect(Book::query()->whereNotNull('isbn')->count())->toBe(65);
    expect(
        Book::query()
            ->whereNotNull('isbn')
            ->selectRaw('isbn, COUNT(*) as total')
            ->groupBy('isbn')
            ->having('total', '>', 1)
            ->count(),
    )->toBe(0);
});

test('popular books seeder can run standalone without pre-seeded admin', function () {
    (new GenreSeeder)->run();
    (new LanguageSeeder)->run();

    (new PopularBooksSeeder)->run();

    expect(Book::query()->where('is_public', true)->count())->toBe(65);
    expect(User::query()->where('email', 'admin@asrofilio.test')->exists())->toBeTrue();
});

test('popular books include metadata cover urls', function () {
    seedPopularBooksDependencies();

    (new PopularBooksSeeder)->run();

    $book = Book::query()->where('title', 'Laskar Pelangi')->firstOrFail();

    expect($book->metadata['cover_url'] ?? null)
        ->toContain('covers.openlibrary.org')
        ->and($book->cover_url)->toContain('covers.openlibrary.org');
});
