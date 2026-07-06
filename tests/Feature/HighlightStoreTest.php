<?php

use App\Models\Book;
use App\Models\Highlight;
use App\Models\User;

test('authenticated user can store highlight via json', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->postJson(route('highlights.store'), [
            'book_id' => $book->id,
            'text' => 'A wise passage',
            'cfi_start' => 'page:10:text:abc123',
            'cfi_end' => 'page:10:text:abc123',
            'color' => '#fef08a',
            'chapter_title' => 'Foreword',
        ])
        ->assertOk()
        ->assertJsonPath('highlight.text', 'A wise passage')
        ->assertJsonPath('highlight.color', '#fef08a')
        ->assertJsonPath('highlight.book_id', $book->id);

    $this->assertDatabaseHas('highlights', [
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'text' => 'A wise passage',
        'cfi_start' => 'page:10:text:abc123',
        'color' => '#fef08a',
        'chapter_title' => 'Foreword',
    ]);

    expect(Highlight::query()->count())->toBe(1);
});

test('authenticated user can store highlight via redirect', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->post(route('highlights.store'), [
            'book_id' => $book->id,
            'text' => 'Another passage',
            'cfi_start' => 'page:5:text:xyz',
            'color' => '#bbf7d0',
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Highlight saved.');

    $this->assertDatabaseHas('highlights', [
        'user_id' => $user->id,
        'text' => 'Another passage',
    ]);
});
