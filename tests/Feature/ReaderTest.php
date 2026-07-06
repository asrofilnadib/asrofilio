<?php

use App\Enums\BookFileType;
use App\Models\Book;
use App\Models\Note;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('reader page includes pdf file props', function () {
    Storage::fake('local');

    $path = 'books/1/sample.pdf';
    Storage::disk('local')->put($path, '%PDF-1.4 test content');

    $user = User::factory()->create();
    $book = Book::factory()->create([
        'is_public' => true,
        'file_path' => $path,
        'file_type' => BookFileType::Pdf,
        'page_count' => 320,
    ]);

    $user->userBooks()->create([
        'book_id' => $book->id,
        'current_page' => 12,
    ]);

    $this->actingAs($user)
        ->get(route('reader.show', $book))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reader/show')
            ->has('fileUrl')
            ->where('fileType', 'pdf')
            ->where('initialPage', 12)
            ->has('chapters')
            ->has('bookmarks')
            ->has('highlights')
            ->has('notes')
        );
});

test('reader page includes notes for the current book', function () {
    Storage::fake('local');

    $path = 'books/1/sample.pdf';
    Storage::disk('local')->put($path, '%PDF-1.4 test content');

    $user = User::factory()->create();
    $book = Book::factory()->create([
        'is_public' => true,
        'file_path' => $path,
        'file_type' => BookFileType::Pdf,
    ]);

    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    Note::factory()->create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'user_book_id' => $userBook->id,
        'content' => 'Shepherd boy met the king.',
        'quoted_text' => 'But the old man wanted to talk',
        'anchor_percent' => 42,
        'cfi_location' => 'page:24:text:abc123',
    ]);

    $this->actingAs($user)
        ->get(route('reader.show', $book))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notes', 1)
            ->where('notes.0.content', 'Shepherd boy met the king.')
            ->where('notes.0.quoted_text', 'But the old man wanted to talk')
            ->where('notes.0.anchor_percent', 42)
        );
});

test('authenticated user can stream pdf book file', function () {
    Storage::fake('local');

    $path = 'books/1/sample.pdf';
    Storage::disk('local')->put($path, '%PDF-1.4 test content');

    $user = User::factory()->create();
    $book = Book::factory()->create([
        'is_public' => true,
        'file_path' => $path,
        'file_type' => BookFileType::Pdf,
    ]);

    $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->get(route('reader.file', $book))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('user can update pdf reading progress', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create([
        'is_public' => true,
        'file_type' => BookFileType::Pdf,
        'page_count' => 100,
    ]);

    $userBook = $user->userBooks()->create(['book_id' => $book->id]);

    $this->actingAs($user)
        ->patchJson(route('reader.progress', $book), [
            'current_page' => 25,
            'progress_percent' => 25,
        ])
        ->assertOk()
        ->assertJsonPath('userBook.current_page', 25)
        ->assertJsonPath('userBook.progress_percent', 25);

    expect($userBook->fresh()->current_page)->toBe(25);
});

test('progress endpoint returns json not inertia', function () {
    $user = User::factory()->create();
    $book = Book::factory()->create([
        'is_public' => true,
        'file_type' => BookFileType::Pdf,
        'page_count' => 50,
    ]);

    $user->userBooks()->create(['book_id' => $book->id]);

    $response = $this->actingAs($user)
        ->withHeaders([
            'Accept' => 'application/json',
            'X-Requested-With' => 'XMLHttpRequest',
        ])
        ->patch(route('reader.progress', $book), [
            'current_page' => 10,
            'progress_percent' => 20,
        ]);

    $response
        ->assertOk()
        ->assertHeader('content-type', 'application/json')
        ->assertJsonStructure(['userBook']);
});
