<?php

namespace App\Services\BookMetadata;

class IsbnLookupService
{
    public function __construct(
        private GoogleBooksService $googleBooks,
        private OpenLibraryService $openLibrary,
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function lookup(string $isbn): ?array
    {
        $normalizedIsbn = $this->normalizeIsbn($isbn);

        if ($normalizedIsbn === '') {
            return null;
        }

        $result = $this->googleBooks->searchByIsbn($normalizedIsbn);

        if ($result !== null) {
            $result['source'] = 'google_books';

            return $result;
        }

        $result = $this->openLibrary->searchByIsbn($normalizedIsbn);

        if ($result !== null) {
            $result['source'] = 'open_library';

            return $result;
        }

        return null;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function search(string $title, ?string $author = null): ?array
    {
        $result = $this->googleBooks->searchByTitle($title, $author);

        if ($result !== null) {
            $result['source'] = 'google_books';

            return $result;
        }

        $result = $this->openLibrary->searchByTitle($title, $author);

        if ($result !== null) {
            $result['source'] = 'open_library';

            return $result;
        }

        return null;
    }

    public function normalizeIsbn(string $isbn): string
    {
        return preg_replace('/[^0-9X]/i', '', $isbn) ?? '';
    }
}
