<?php

namespace App\Services\BookMetadata;

class BookSearchService
{
    public function __construct(
        private GoogleBooksService $googleBooks,
        private OpenLibraryService $openLibrary,
    ) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function search(string $query, ?string $author = null, int $limit = 15): array
    {
        $perSource = min(10, $limit);

        $googleResults = $this->googleBooks->searchMany($query, $author, $perSource);
        $openLibraryResults = $this->openLibrary->searchMany($query, $author, $perSource);

        return $this->mergeResults($googleResults, $openLibraryResults, $limit);
    }

    /**
     * @param  list<array<string, mixed>>  $googleResults
     * @param  list<array<string, mixed>>  $openLibraryResults
     * @return list<array<string, mixed>>
     */
    private function mergeResults(array $googleResults, array $openLibraryResults, int $limit): array
    {
        $merged = [];
        $seen = [];

        foreach ([...$googleResults, ...$openLibraryResults] as $result) {
            $key = $this->resultKey($result);

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;
            $merged[] = $result;

            if (count($merged) >= $limit) {
                break;
            }
        }

        return $merged;
    }

    /**
     * @param  array<string, mixed>  $result
     */
    private function resultKey(array $result): string
    {
        if (! empty($result['isbn'])) {
            return 'isbn:'.strtoupper((string) $result['isbn']);
        }

        if (! empty($result['google_books_id'])) {
            return 'gb:'.(string) $result['google_books_id'];
        }

        if (! empty($result['open_library_key'])) {
            return 'ol:'.(string) $result['open_library_key'];
        }

        $title = strtolower(trim((string) ($result['title'] ?? '')));
        $author = strtolower(trim((string) ($result['author'] ?? '')));

        return "title:{$title}|author:{$author}";
    }
}
