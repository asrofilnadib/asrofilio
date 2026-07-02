<?php

use App\Enums\BookFileType;
use App\Enums\UserRole;
use App\Models\Book;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admin can upload a pdf when updating a book', function () {
    Storage::fake('local');

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $book = Book::factory()->create([
        'file_path' => null,
        'file_type' => null,
    ]);

    $file = UploadedFile::fake()->create('the-alchemist.pdf', 100, 'application/pdf');

    $this->actingAs($admin)
        ->put(route('admin.books.update', $book), [
            'title' => $book->title,
            'author' => $book->author,
            'file' => $file,
        ])
        ->assertRedirect(route('admin.books.index'));

    $book->refresh();

    expect($book->file_type)->toBe(BookFileType::Pdf)
        ->and($book->file_path)->not->toBeNull();

    Storage::disk('local')->assertExists($book->file_path);
});

test('admin can replace an existing book file on update', function () {
    Storage::fake('local');

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $book = Book::factory()->create([
        'file_path' => 'books/1/old.epub',
        'file_type' => BookFileType::Epub,
    ]);

    Storage::disk('local')->put('books/1/old.epub', 'old-content');

    $file = UploadedFile::fake()->create('replacement.pdf', 100, 'application/pdf');

    $this->actingAs($admin)
        ->put(route('admin.books.update', $book), [
            'title' => $book->title,
            'author' => $book->author,
            'file' => $file,
        ])
        ->assertRedirect(route('admin.books.index'));

    $book->refresh();

    expect($book->file_type)->toBe(BookFileType::Pdf)
        ->and($book->file_path)->not->toBe('books/1/old.epub');

    Storage::disk('local')->assertMissing('books/1/old.epub');
    Storage::disk('local')->assertExists($book->file_path);
});
