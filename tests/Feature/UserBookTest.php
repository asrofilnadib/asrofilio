<?php

use App\Enums\ReadingStatus;
use App\Models\Book;
use App\Models\User;
use App\Models\UserBook;
use App\Services\AnalyticsService;

test('user can update reading status with patch', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = UserBook::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'status' => ReadingStatus::Unread,
    ]);

    $this->actingAs($user)
        ->patch(route('user-books.update', $userBook), [
            'status' => ReadingStatus::InProgress->value,
        ])
        ->assertRedirect();

    expect($userBook->fresh()->status)->toBe(ReadingStatus::InProgress);
});

test('user can remove book from library', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    $userBook = UserBook::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
    ]);

    $this->actingAs($user)
        ->delete(route('user-books.destroy', $userBook))
        ->assertRedirect(route('library.index', ['scope' => 'mine']));

    expect($user->userBooks()->count())->toBe(0);
});

test('library count excludes books that were soft deleted', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create(['is_public' => true]);
    UserBook::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
    ]);

    $book->delete();

    $breakdown = app(AnalyticsService::class)->getLibraryStatusBreakdown($user);

    expect(array_sum($breakdown))->toBe(0);
    expect($user->userBooks()->count())->toBe(0);
});
