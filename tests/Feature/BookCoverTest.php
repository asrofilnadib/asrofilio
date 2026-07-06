<?php

use App\Models\Book;
use App\Models\Highlight;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('book cover url points to cover route when file exists', function () {
    Storage::fake('local');

    $book = Book::factory()->create([
        'cover_path' => 'books/1/cover.jpg',
        'metadata' => ['cover_url' => 'https://example.com/fallback.jpg'],
    ]);

    Storage::disk('local')->put('books/1/cover.jpg', 'fake-image');

    expect($book->cover_url)->toBe(route('books.cover', $book));
});

test('book cover url falls back to metadata when file is missing', function () {
    Storage::fake('local');

    $book = Book::factory()->create([
        'cover_path' => 'books/1/cover.jpg',
        'metadata' => ['cover_url' => 'https://example.com/cover.jpg'],
    ]);

    expect($book->cover_url)->toBe('https://example.com/cover.jpg');
});

test('book cover url is included when serializing to array', function () {
    Storage::fake('local');

    $book = Book::factory()->create([
        'cover_path' => null,
        'metadata' => ['cover_url' => 'https://covers.openlibrary.org/b/id/7438753-M.jpg'],
    ]);

    expect($book->toArray())
        ->toHaveKey('cover_url')
        ->and($book->toArray()['cover_url'])
        ->toBe('https://covers.openlibrary.org/b/id/7438753-M.jpg');
});

test('library show page includes book cover url', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $book = Book::factory()->create([
        'is_public' => true,
        'cover_path' => null,
        'metadata' => ['cover_url' => 'https://covers.openlibrary.org/b/id/7438753-M.jpg'],
    ]);

    $this->actingAs($user)
        ->get(route('library.show', $book))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/show')
            ->where('book.cover_url', 'https://covers.openlibrary.org/b/id/7438753-M.jpg')
        );
});

test('highlights index loads book cover url without error', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $book = Book::factory()->create([
        'is_public' => true,
        'cover_path' => 'books/1/cover.jpg',
    ]);

    Storage::disk('local')->put('books/1/cover.jpg', 'fake-image');

    Highlight::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'text' => 'A memorable line',
    ]);

    $this->actingAs($user)
        ->get(route('highlights.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('highlights/index')
            ->has('highlights.data', 1)
            ->where('highlights.data.0.book.cover_url', route('books.cover', $book))
        );
});

test('authenticated user can view analytics page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('analytics.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('analytics/index')
        ->has('statusBreakdown')
        ->has('stats')
    );
});
