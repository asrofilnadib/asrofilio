<?php

use App\Models\Book;
use App\Models\Highlight;
use App\Models\Note;
use App\Models\User;

test('user in library can fetch book annotations as json', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    Highlight::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'text' => 'A wise passage',
    ]);

    Note::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'content' => 'Remember this chapter',
    ]);

    $this->actingAs($user)
        ->getJson(route('library.annotations', $book))
        ->assertOk()
        ->assertJsonCount(1, 'highlights')
        ->assertJsonCount(1, 'notes')
        ->assertJsonPath('highlights.0.text', 'A wise passage')
        ->assertJsonPath('notes.0.content', 'Remember this chapter');
});

test('guest cannot fetch book annotations', function () {
    $book = Book::factory()->create(['is_public' => true]);

    $this->getJson(route('library.annotations', $book))
        ->assertUnauthorized();
});

test('user not in library cannot fetch book annotations', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);

    $other->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->getJson(route('library.annotations', $book))
        ->assertForbidden();
});

test('library show includes highlights and notes for user in library', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    Highlight::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
    ]);

    Note::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
    ]);

    $this->actingAs($user)
        ->get(route('library.show', $book))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('library/show')
            ->has('highlights', 1)
            ->has('notes', 1)
        );
});

test('user can schedule a book via patch', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->patch(route('user-books.update', $userBook), [
            'status' => 'scheduled',
            'scheduled_at' => '2026-08-15',
        ])
        ->assertRedirect();

    $userBook->refresh();

    expect($userBook->status->value)->toBe('scheduled')
        ->and($userBook->scheduled_at?->toDateString())->toBe('2026-08-15');
});
