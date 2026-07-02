<?php

use App\Enums\ReadingStatus;
use App\Enums\UserRole;
use App\Models\Book;
use App\Models\Highlight;
use App\Models\Note;
use App\Models\User;

test('admin dashboard includes recent tables', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $member = User::factory()->create();
    $book = Book::factory()->create();

    $member->userBooks()->create([
        'book_id' => $book->id,
        'status' => ReadingStatus::InProgress,
        'progress_percent' => 40,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('recentUsers')
            ->has('recentBooks')
            ->has('recentActivity')
            ->has('tableLimits')
            ->has('tableTotals')
            ->where('tableLimits.users_limit', '5')
        );
});

test('admin dashboard respects table limit query params', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    User::factory()->count(12)->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard', ['users_limit' => 10]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tableLimits.users_limit', '10')
            ->has('recentUsers', 10)
        );
});

test('admin can view user activity profile', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $member = User::factory()->create();
    $book = Book::factory()->create(['title' => 'Test Book']);

    $userBook = $member->userBooks()->create([
        'book_id' => $book->id,
        'status' => ReadingStatus::InProgress,
        'current_page' => 12,
        'progress_percent' => 30,
    ]);

    Highlight::factory()->create([
        'user_id' => $member->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'text' => 'A memorable passage',
    ]);

    Note::factory()->create([
        'user_id' => $member->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'content' => 'Important note about chapter 2',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.users.show', $member))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/show')
            ->where('user.id', $member->id)
            ->where('stats.library_count', 1)
            ->where('stats.reading_count', 1)
            ->where('stats.highlights_count', 1)
            ->where('stats.notes_count', 1)
            ->has('currently_reading', 1)
            ->has('library', 1)
            ->has('highlights', 1)
            ->has('notes', 1)
        );
});

test('regular user cannot view admin user profile', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.users.show', $target))
        ->assertForbidden();
});

test('admin users index includes activity counts', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $member = User::factory()->create();
    $book = Book::factory()->create();

    $userBook = $member->userBooks()->create([
        'book_id' => $book->id,
        'status' => ReadingStatus::InProgress,
    ]);

    Highlight::factory()->create([
        'user_id' => $member->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.users.index'));

    $response
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users')
            ->where('users', function ($users) use ($member): bool {
                $row = collect($users)->firstWhere('id', $member->id);

                return $row !== null
                    && $row['user_books_count'] === 1
                    && $row['reading_count'] === 1
                    && $row['highlights_count'] === 1;
            })
        );
});
