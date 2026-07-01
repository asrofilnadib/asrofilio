<?php

use App\Enums\UserRole;
use App\Models\Book;
use App\Models\User;
use Database\Seeders\GenreSeeder;
use Illuminate\Support\Facades\Http;

test('guest can view home page with public library browse', function () {
    $this->seed(GenreSeeder::class);
    $book = Book::factory()->create(['is_public' => true, 'title' => 'Public Book']);
    attachFictionGenre($book);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('home/index')
        ->has('books.data', 0)
        ->has('genres', 12)
        ->has('counts')
        ->where('filters.scope', 'public')
    );
});

test('guest can browse public library', function () {
    $this->seed(GenreSeeder::class);
    $book = Book::factory()->create(['is_public' => true, 'title' => 'Public Book']);
    attachFictionGenre($book);

    $this->get(route('library.index', ['genres' => ['fiction']]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/index')
            ->has('books.data', 1)
            ->has('genres', 12)
            ->has('counts')
            ->where('filters.scope', 'public')
        );
});

test('guest cannot add book to library', function () {
    $book = Book::factory()->create(['is_public' => true]);

    $this->post(route('user-books.store', $book))->assertRedirect(route('login'));
});

test('authenticated user can add book to library', function () {
    $book = Book::factory()->create(['is_public' => true]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('user-books.store', $book))
        ->assertRedirect();

    expect($user->userBooks()->where('book_id', $book->id)->exists())->toBeTrue();
});

test('guest is redirected from authenticated routes', function () {
    $this->get(route('highlights.index'))->assertRedirect(route('login'));
    $this->get(route('analytics.index'))->assertRedirect(route('login'));
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'reader@asrofilio.test',
        'password' => bcrypt('password'),
    ]);

    $response = $this->post(route('login'), [
        'email' => 'reader@asrofilio.test',
        'password' => 'password',
    ]);

    $response->assertRedirect(route('home'));
    $this->assertAuthenticatedAs($user);
});

test('admin can access admin dashboard', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/dashboard'));
});

test('regular user cannot access admin dashboard', function () {
    $user = User::factory()->create(['role' => UserRole::User]);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin can create genre via modal form', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->post(route('admin.genres.store'), [
            'name' => 'Test Genre',
            'slug' => 'test-genre',
            'sort_order' => 99,
            'is_active' => true,
        ])
        ->assertRedirect(route('admin.genres.index'));

    $this->assertDatabaseHas('genres', ['slug' => 'test-genre']);
});

test('book search requires authentication', function () {
    $this->get(route('api.books.search', ['q' => 'pride']))->assertUnauthorized();
});

test('authenticated user can search books via api', function () {
    Http::fake([
        'www.googleapis.com/*' => Http::response([
            'items' => [[
                'id' => 'abc123',
                'volumeInfo' => [
                    'title' => 'Pride and Prejudice',
                    'authors' => ['Jane Austen'],
                    'industryIdentifiers' => [
                        ['type' => 'ISBN_13', 'identifier' => '9780141439518'],
                    ],
                    'pageCount' => 432,
                    'description' => 'A classic novel.',
                ],
            ]],
        ], 200),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('api.books.search', ['q' => 'pride']))
        ->assertOk()
        ->assertJsonFragment(['title' => 'Pride and Prejudice']);
});

test('guest cannot stream book file', function () {
    $book = Book::factory()->create([
        'is_public' => true,
        'file_path' => 'books/1/sample.epub',
    ]);

    $this->get(route('reader.file', $book))->assertRedirect(route('login'));
});

test('user with book in library can view reader page', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true, 'file_path' => 'books/1/sample.epub']);

    $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->get(route('reader.show', $book))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('reader/show'));
});
