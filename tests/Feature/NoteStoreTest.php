<?php

use App\Models\Book;
use App\Models\Note;
use App\Models\User;

test('authenticated user can store note with quoted text and anchor percent', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->post(route('notes.store'), [
            'book_id' => $book->id,
            'content' => 'Important passage about the king.',
            'quoted_text' => 'But the old man wanted to talk',
            'anchor_percent' => 42,
            'cfi_location' => 'page:24:text:abc123',
            'chapter_title' => 'Chapter 3',
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Note saved.');

    $this->assertDatabaseHas('notes', [
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'content' => 'Important passage about the king.',
        'quoted_text' => 'But the old man wanted to talk',
        'anchor_percent' => 42,
        'cfi_location' => 'page:24:text:abc123',
        'chapter_title' => 'Chapter 3',
    ]);
});

test('store note rejects anchor percent outside valid range', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->post(route('notes.store'), [
            'book_id' => $book->id,
            'content' => 'A note',
            'anchor_percent' => 150,
        ])
        ->assertSessionHasErrors('anchor_percent');

    expect(Note::query()->count())->toBe(0);
});

test('authenticated user can store note via json', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->postJson(route('notes.store'), [
            'book_id' => $book->id,
            'content' => 'Important passage about the king.',
            'quoted_text' => 'But the old man wanted to talk',
            'anchor_percent' => 42,
            'cfi_location' => 'page:24:text:abc123',
            'chapter_title' => 'Chapter 3',
        ])
        ->assertOk()
        ->assertJsonPath('note.content', 'Important passage about the king.')
        ->assertJsonPath('note.quoted_text', 'But the old man wanted to talk')
        ->assertJsonPath('note.anchor_percent', 42)
        ->assertJsonPath('note.book_id', $book->id);

    $this->assertDatabaseHas('notes', [
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'content' => 'Important passage about the king.',
        'quoted_text' => 'But the old man wanted to talk',
        'anchor_percent' => 42,
        'cfi_location' => 'page:24:text:abc123',
        'chapter_title' => 'Chapter 3',
    ]);
});
