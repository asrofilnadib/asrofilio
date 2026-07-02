<?php

use App\Models\Book;
use App\Models\User;
use Database\Seeders\GenreSeeder;

test('library shows all books when no genre filter is applied', function () {
    $this->seed(GenreSeeder::class);
    $book = Book::factory()->create(['is_public' => true]);
    attachFictionGenre($book);

    $this->get(route('library.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/index')
            ->has('books.data', 1)
            ->where('filters.genres', null)
        );
});

test('library shows books when genres are selected', function () {
    $this->seed(GenreSeeder::class);
    $book = Book::factory()->create(['is_public' => true, 'title' => 'Public Book']);
    attachFictionGenre($book);

    $this->get(route('library.index', ['genres' => ['fiction']]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/index')
            ->has('books.data', 1)
            ->where('filters.genres', ['fiction'])
        );
});

test('library can sort books by title', function () {
    $this->seed(GenreSeeder::class);

    $zebra = Book::factory()->create(['is_public' => true, 'title' => 'Zebra Tales']);
    $alpha = Book::factory()->create(['is_public' => true, 'title' => 'Alpha Stories']);
    attachFictionGenre($zebra);
    attachFictionGenre($alpha);

    $this->get(route('library.index', [
        'genres' => ['fiction'],
        'sort' => 'title_asc',
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('books.data.0.title', 'Alpha Stories')
            ->where('books.data.1.title', 'Zebra Tales')
            ->where('filters.sort', 'title_asc')
        );
});

test('my library books include user_book for card actions', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create([
        'book_id' => $book->id,
        'status' => 'unread',
    ]);

    $this->actingAs($user)
        ->get(route('library.index', ['scope' => 'mine']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/index')
            ->has('books.data', 1)
            ->where('books.data.0.id', $book->id)
            ->where('books.data.0.user_book.id', $userBook->id)
            ->where('books.data.0.user_book.status', 'unread')
        );
});

test('public library includes user_book only for books in user library', function () {
    $user = User::factory()->create();
    $inLibrary = Book::factory()->create(['is_public' => true, 'title' => 'In Library Book']);
    Book::factory()->create(['is_public' => true, 'title' => 'Public Only Book']);

    $userBook = $user->userBooks()->create(['book_id' => $inLibrary->id]);

    $this->actingAs($user)
        ->get(route('library.index', ['scope' => 'public']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/index')
            ->has('books.data', 2)
            ->where('books.data', fn ($books) => collect($books)->contains(
                fn ($book) => $book['title'] === 'In Library Book'
                    && $book['user_book']['id'] === $userBook->id,
            ))
            ->where('books.data', fn ($books) => collect($books)->contains(
                fn ($book) => $book['title'] === 'Public Only Book'
                    && $book['user_book'] === null,
            ))
        );
});

test('user can switch locale', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('preferences.locale'), ['locale' => 'id'])
        ->assertRedirect();

    expect(session('locale'))->toBe('id');
});
