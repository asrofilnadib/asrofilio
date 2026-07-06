<?php

use App\Enums\BookFileType;
use App\Enums\UserRole;
use App\Models\Book;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

test('admin can stage a book file upload for filepond', function () {
    Storage::fake('local');

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $file = UploadedFile::fake()->create('the-alchemist.pdf', 100, 'application/pdf');

    $response = $this->actingAs($admin)
        ->post(route('admin.books.uploads.process'), [
            'file' => $file,
        ]);

    $response
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8');

    expect(Str::isUuid($response->getContent()))->toBeTrue();
});

test('admin can stage a libgen style pdf with octet stream mime', function () {
    Storage::fake('local');

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $file = UploadedFile::fake()->create(
        'libgen.info-grit-angella-duckworth-idn-pr_095ffacf822.pdf',
        5300,
        'application/octet-stream',
    );

    $response = $this->actingAs($admin)
        ->withHeaders([
            'X-Requested-With' => 'XMLHttpRequest',
            'Accept' => 'text/plain',
        ])
        ->post(route('admin.books.uploads.process'), ['file' => $file]);

    $response
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8');

    expect(Str::isUuid(trim($response->getContent())))->toBeTrue();
});

test('staged upload validation errors return plain text for xhr requests', function () {
    Storage::fake('local');

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $file = UploadedFile::fake()->create('notes.txt', 100, 'text/plain');

    $this->actingAs($admin)
        ->withHeaders([
            'X-Requested-With' => 'XMLHttpRequest',
            'Accept' => 'text/plain',
        ])
        ->post(route('admin.books.uploads.process'), ['file' => $file])
        ->assertUnprocessable()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
});

test('admin can upload a pdf when updating a book via staged upload', function () {
    Storage::fake('local');

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $book = Book::factory()->create([
        'file_path' => null,
        'file_type' => null,
    ]);

    $file = UploadedFile::fake()->create('the-alchemist.pdf', 100, 'application/pdf');

    $stagedId = $this->actingAs($admin)
        ->post(route('admin.books.uploads.process'), ['file' => $file])
        ->assertOk()
        ->getContent();

    $this->actingAs($admin)
        ->put(route('admin.books.update', $book), [
            'title' => $book->title,
            'author' => $book->author,
            'staged_upload_id' => $stagedId,
        ])
        ->assertRedirect(route('admin.books.index'));

    $book->refresh();

    expect($book->file_type)->toBe(BookFileType::Pdf)
        ->and($book->file_path)->not->toBeNull();

    Storage::disk('local')->assertExists($book->file_path);
});

test('book update ignores filepond server id sent as file field', function () {
    Storage::fake('local');

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $book = Book::factory()->create([
        'file_path' => null,
        'file_type' => null,
    ]);

    $file = UploadedFile::fake()->create('the-alchemist.pdf', 100, 'application/pdf');

    $stagedId = $this->actingAs($admin)
        ->post(route('admin.books.uploads.process'), ['file' => $file])
        ->assertOk()
        ->getContent();

    $this->actingAs($admin)
        ->put(route('admin.books.update', $book), [
            'title' => $book->title,
            'author' => $book->author,
            'staged_upload_id' => $stagedId,
            'file' => $stagedId,
        ])
        ->assertRedirect(route('admin.books.index'))
        ->assertSessionHasNoErrors();

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

    $stagedId = $this->actingAs($admin)
        ->post(route('admin.books.uploads.process'), ['file' => $file])
        ->assertOk()
        ->getContent();

    $this->actingAs($admin)
        ->put(route('admin.books.update', $book), [
            'title' => $book->title,
            'author' => $book->author,
            'staged_upload_id' => $stagedId,
        ])
        ->assertRedirect(route('admin.books.index'));

    $book->refresh();

    expect($book->file_type)->toBe(BookFileType::Pdf)
        ->and($book->file_path)->not->toBe('books/1/old.epub');

    Storage::disk('local')->assertMissing('books/1/old.epub');
    Storage::disk('local')->assertExists($book->file_path);
});
