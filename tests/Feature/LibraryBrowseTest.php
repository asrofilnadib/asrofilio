<?php

use App\Models\Book;
use App\Models\User;
use Database\Seeders\GenreSeeder;

test('library shows no books until a genre is selected', function () {
    $this->seed(GenreSeeder::class);
    $book = Book::factory()->create(['is_public' => true]);
    attachFictionGenre($book);

    $this->get(route('library.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/index')
            ->has('books.data', 0)
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

test('user can switch locale', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('preferences.locale'), ['locale' => 'id'])
        ->assertRedirect();

    expect(session('locale'))->toBe('id');
});
