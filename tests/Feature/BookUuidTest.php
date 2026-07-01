<?php

use App\Models\Book;
use App\Models\User;

test('new books receive an 8-character public code automatically', function () {
    $book = Book::factory()->create();

    expect($book->uuid)->toBeString()->toHaveLength(8);
});

test('library routes use book uuid instead of numeric id', function () {
    $book = Book::factory()->create(['is_public' => true]);
    $user = User::factory()->create();

    $url = route('library.show', $book);

    expect($url)->toContain($book->uuid);
    expect($url)->not->toContain('/'.$book->id);

    $this->actingAs($user)
        ->get($url)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/show')
            ->where('book.uuid', $book->uuid)
        );
});

test('numeric id no longer resolves library book routes', function () {
    $book = Book::factory()->create(['is_public' => true]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/library/'.$book->id)
        ->assertNotFound();
});
