<?php

use App\Models\Book;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Support\Facades\Http;

test('authenticated user can add a book to library from search metadata', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('user-books.create'), [
        'title' => 'The Alchemist',
        'author' => 'Paulo Coelho',
        'isbn' => '9780062315007',
        'google_books_id' => 'google-test-id',
        'cover_url' => 'https://books.google.com/books/content?id=test',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $book = Book::query()->where('google_books_id', 'google-test-id')->first();

    expect($book)->not->toBeNull();
    expect($book->title)->toBe('The Alchemist');
    expect($user->userBooks()->where('book_id', $book->id)->exists())->toBeTrue();
});

test('adding the same book twice does not duplicate library entries', function () {
    $user = User::factory()->create();

    $payload = [
        'title' => 'The Alchemist',
        'author' => 'Paulo Coelho',
        'google_books_id' => 'google-dup-test',
    ];

    $this->actingAs($user)->post(route('user-books.create'), $payload)->assertRedirect();
    $this->actingAs($user)->post(route('user-books.create'), $payload)->assertRedirect();

    expect(Book::query()->where('google_books_id', 'google-dup-test')->count())->toBe(1);
    expect(UserBook::query()->where('user_id', $user->id)->count())->toBe(1);
});

test('user can add a book by isbn lookup', function () {
    Http::fake([
        'www.googleapis.com/books/v1/volumes*' => Http::response([
            'items' => [
                [
                    'id' => 'google-isbn',
                    'volumeInfo' => [
                        'title' => 'The Alchemist',
                        'authors' => ['Paulo Coelho'],
                        'industryIdentifiers' => [
                            ['type' => 'ISBN_13', 'identifier' => '9780062315007'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('user-books.create'), [
        'isbn' => '978-0-06-231500-7',
    ]);

    $response->assertRedirect();
    expect($user->userBooks()->count())->toBe(1);
});

test('guest cannot add a book to library', function () {
    $this->post(route('user-books.create'), [
        'title' => 'Test Book',
        'author' => 'Test Author',
    ])->assertRedirect(route('login'));
});
