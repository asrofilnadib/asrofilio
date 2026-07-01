<?php

namespace App\Services;

use App\Enums\ReadingStatus;
use App\Jobs\ProcessBookUpload;
use App\Models\Book;
use App\Models\User;
use App\Models\UserBook;
use App\Services\BookMetadata\IsbnLookupService;
use Illuminate\Validation\ValidationException;

class AddBookToLibraryService
{
    public function __construct(
        private IsbnLookupService $isbnLookup,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function add(User $user, array $data): UserBook
    {
        $payload = $this->resolveBookPayload($data);
        $book = $this->findOrCreateBook($user, $payload);

        return UserBook::query()->updateOrCreate(
            ['user_id' => $user->id, 'book_id' => $book->id],
            ['status' => ReadingStatus::Unread],
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function resolveBookPayload(array $data): array
    {
        if ($this->filled($data, 'title') && $this->filled($data, 'author')) {
            return $data;
        }

        if (! $this->filled($data, 'isbn')) {
            throw ValidationException::withMessages([
                'title' => 'Provide a title and author, or a valid ISBN.',
            ]);
        }

        $lookup = $this->isbnLookup->lookup((string) $data['isbn']);

        if ($lookup === null) {
            throw ValidationException::withMessages([
                'isbn' => 'No book found for this ISBN.',
            ]);
        }

        return array_merge($lookup, array_filter([
            'isbn' => $data['isbn'],
        ]));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function findOrCreateBook(User $user, array $data): Book
    {
        $book = $this->findExistingBook($data);

        if ($book !== null) {
            return $book;
        }

        $metadata = array_filter([
            'cover_url' => $data['cover_url'] ?? null,
            'published_date' => $data['published_date'] ?? null,
            'publisher' => $data['publisher'] ?? null,
            'source' => $data['source'] ?? null,
        ]);

        $book = Book::query()->create([
            'title' => (string) $data['title'],
            'subtitle' => $data['subtitle'] ?? null,
            'author' => (string) ($data['author'] ?? 'Unknown'),
            'isbn' => $data['isbn'] ?? null,
            'description' => $data['description'] ?? null,
            'page_count' => $data['page_count'] ?? null,
            'google_books_id' => $data['google_books_id'] ?? null,
            'open_library_key' => $data['open_library_key'] ?? null,
            'metadata' => $metadata !== [] ? $metadata : null,
            'is_public' => false,
            'created_by' => $user->id,
        ]);

        ProcessBookUpload::dispatch($book);

        return $book;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function findExistingBook(array $data): ?Book
    {
        if ($this->filled($data, 'google_books_id')) {
            $book = Book::query()
                ->where('google_books_id', $data['google_books_id'])
                ->first();

            if ($book !== null) {
                return $book;
            }
        }

        if ($this->filled($data, 'open_library_key')) {
            $book = Book::query()
                ->where('open_library_key', $data['open_library_key'])
                ->first();

            if ($book !== null) {
                return $book;
            }
        }

        if ($this->filled($data, 'isbn')) {
            $normalized = $this->isbnLookup->normalizeIsbn((string) $data['isbn']);

            return Book::query()
                ->where('isbn', $normalized)
                ->orWhere('isbn', $data['isbn'])
                ->first();
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function filled(array $data, string $key): bool
    {
        return isset($data[$key]) && $data[$key] !== '' && $data[$key] !== null;
    }
}
