<?php

namespace App\Services\BookMetadata;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class GoogleBooksService
{
    private const string BASE_URL = 'https://www.googleapis.com/books/v1';

    /**
     * @return array<string, mixed>|null
     */
    public function searchByIsbn(string $isbn): ?array
    {
        return $this->search(['q' => 'isbn:'.$isbn]);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function searchByTitle(string $title, ?string $author = null): ?array
    {
        $query = 'intitle:'.urlencode($title);

        if ($author !== null) {
            $query .= '+inauthor:'.urlencode($author);
        }

        return $this->search(['q' => $query]);
    }

    /**
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>|null
     */
    public function search(array $params): ?array
    {
        $results = $this->searchMany(
            (string) ($params['q'] ?? ''),
            null,
            (int) ($params['maxResults'] ?? 1),
        );

        return $results[0] ?? null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function searchMany(string $query, ?string $author = null, int $limit = 10): array
    {
        if (trim($query) === '') {
            return [];
        }

        $searchQuery = $query;

        if ($author !== null && $author !== '') {
            $searchQuery = 'intitle:'.$query.'+inauthor:'.$author;
        }

        try {
            $apiKey = config('services.google_books.key');

            $response = Http::timeout(10)
                ->get(self::BASE_URL.'/volumes', array_filter([
                    'q' => $searchQuery,
                    'maxResults' => min($limit, 40),
                    'key' => $apiKey,
                ]));

            if (! $response->successful()) {
                return [];
            }

            $data = $response->json();

            if (! is_array($data) || empty($data['items'])) {
                return [];
            }

            return collect($data['items'])
                ->take($limit)
                ->map(fn (array $volume): array => [
                    ...$this->normalizeVolume($volume),
                    'source' => 'google_books',
                ])
                ->values()
                ->all();
        } catch (ConnectionException) {
            return [];
        }
    }

    /**
     * @param  array<string, mixed>  $volume
     * @return array<string, mixed>
     */
    public function normalizeVolume(array $volume): array
    {
        $info = $volume['volumeInfo'] ?? [];

        return [
            'google_books_id' => $volume['id'] ?? null,
            'title' => $info['title'] ?? null,
            'subtitle' => $info['subtitle'] ?? null,
            'author' => $info['authors'][0] ?? null,
            'authors' => $info['authors'] ?? [],
            'description' => $info['description'] ?? null,
            'page_count' => $info['pageCount'] ?? null,
            'isbn' => $this->extractIsbn($info['industryIdentifiers'] ?? []),
            'language' => $info['language'] ?? null,
            'cover_url' => $info['imageLinks']['thumbnail'] ?? $info['imageLinks']['smallThumbnail'] ?? null,
            'published_date' => $info['publishedDate'] ?? null,
            'publisher' => $info['publisher'] ?? null,
            'categories' => $info['categories'] ?? [],
            'metadata' => $volume,
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $identifiers
     */
    private function extractIsbn(array $identifiers): ?string
    {
        foreach ($identifiers as $identifier) {
            $type = $identifier['type'] ?? '';

            if (in_array($type, ['ISBN_13', 'ISBN_10'], true)) {
                return $identifier['identifier'] ?? null;
            }
        }

        return null;
    }
}
