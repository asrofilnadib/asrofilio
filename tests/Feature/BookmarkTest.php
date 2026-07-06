<?php

use App\Models\Book;
use App\Models\Bookmark;
use App\Models\User;

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

test('user can remove a bookmark while reading', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $user->userBooks()->create(['book_id' => $book->id]);
    $bookmark = Bookmark::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'cfi_location' => 'page:21',
        'label' => 'Page 21',
    ]);

    $this->actingAs($user)
        ->delete(route('bookmarks.destroy', $bookmark))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Bookmark::query()->find($bookmark->id))->toBeNull();
});

test('user cannot remove another users bookmark', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = $owner->userBooks()->create(['book_id' => $book->id]);
    $bookmark = Bookmark::factory()->create([
        'user_id' => $owner->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'cfi_location' => 'page:21',
    ]);

    $this->actingAs($other)
        ->delete(route('bookmarks.destroy', $bookmark))
        ->assertForbidden();

    expect(Bookmark::query()->find($bookmark->id))->not->toBeNull();
});
