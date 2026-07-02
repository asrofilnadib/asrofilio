<?php

use App\Models\Book;
use App\Models\Bookmark;
use App\Models\User;
use App\Models\UserBook;

test('user can save a bookmark while reading', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->post(route('user-books.bookmark.store', $userBook), [
            'cfi_location' => 'page:12',
            'page' => 12,
            'chapter_title' => 'Chapter 1',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $bookmark = Bookmark::query()->first();

    expect($bookmark)->not->toBeNull()
        ->and($bookmark->user_id)->toBe($user->id)
        ->and($bookmark->book_id)->toBe($book->id)
        ->and($bookmark->cfi_location)->toBe('page:12')
        ->and($bookmark->label)->toBe('Page 12')
        ->and($bookmark->chapter_title)->toBe('Chapter 1');
});

test('user cannot bookmark another users library entry', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $owner->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($other)
        ->post(route('user-books.bookmark.store', $userBook), [
            'cfi_location' => 'page:1',
        ])
        ->assertForbidden();

    expect(Bookmark::query()->count())->toBe(0);
});
