<?php

namespace App\Services\BookMetadata;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class OpenLibraryService
{
    private const string BASE_URL = 'https://openlibrary.org';

    /**
     * @return array<string, mixed>|null
     */
    public function searchByIsbn(string $isbn): ?array
    {
        try {
            $response = Http::timeout(10)
                ->get(self::BASE_URL.'/api/books', [
                    'bibkeys' => 'ISBN:'.$isbn,
                    'format' => 'json',
                    'jscmd' => 'data',
                ]);

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();
            $key = 'ISBN:'.$isbn;

            if (! is_array($data) || empty($data[$key])) {
                return null;
            }

            return $this->normalizeBook($data[$key]);
        } catch (ConnectionException) {
            return null;
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    public function searchByTitle(string $title, ?string $author = null): ?array
    {
        try {
            $params = ['title' => $title, 'limit' => 1];

            if ($author !== null) {
                $params['author'] = $author;
            }

            $response = Http::timeout(10)
                ->get(self::BASE_URL.'/search.json', $params);

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();

            if (! is_array($data) || empty($data['docs'][0])) {
                return null;
            }

            return $this->normalizeSearchDoc($data['docs'][0]);
        } catch (ConnectionException) {
            return null;
        }
    }

    /**
     * @param  array<string, mixed>  $book
     * @return array<string, mixed>
     */
    public function normalizeBook(array $book): array
    {
        return [
            'open_library_key' => $book['key'] ?? null,
            'title' => $book['title'] ?? null,
            'subtitle' => $book['subtitle'] ?? null,
            'author' => $book['authors'][0]['name'] ?? null,
            'authors' => collect($book['authors'] ?? [])->pluck('name')->all(),
            'description' => is_string($book['notes'] ?? null) ? $book['notes'] : null,
            'page_count' => $book['number_of_pages'] ?? null,
            'isbn' => $book['identifiers']['isbn_13'][0] ?? $book['identifiers']['isbn_10'][0] ?? null,
            'language' => $book['languages'][0]['key'] ?? null,
            'cover_url' => $book['cover']['medium'] ?? $book['cover']['small'] ?? null,
            'published_date' => $book['publish_date'] ?? null,
            'publisher' => $book['publishers'][0] ?? null,
            'metadata' => $book,
        ];
    }

    /**
     * @param  array<string, mixed>  $doc
     * @return array<string, mixed>
     */
    public function normalizeSearchDoc(array $doc): array
    {
        return [
            'open_library_key' => $doc['key'] ?? null,
            'title' => $doc['title'] ?? null,
            'subtitle' => $doc['subtitle'] ?? null,
            'author' => $doc['author_name'][0] ?? null,
            'authors' => $doc['author_name'] ?? [],
            'description' => null,
            'page_count' => $doc['number_of_pages_median'] ?? null,
            'isbn' => $doc['isbn'][0] ?? null,
            'language' => $doc['language'][0] ?? null,
            'cover_url' => isset($doc['cover_i'])
                ? 'https://covers.openlibrary.org/b/id/'.$doc['cover_i'].'-M.jpg'
                : null,
            'published_date' => $doc['first_publish_year'] ?? null,
            'publisher' => $doc['publisher'][0] ?? null,
            'metadata' => $doc,
        ];
    }
}
