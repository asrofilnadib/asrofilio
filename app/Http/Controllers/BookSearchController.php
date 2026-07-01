<?php

namespace App\Http\Controllers;

use App\Services\BookMetadata\BookSearchService;
use App\Services\BookMetadata\IsbnLookupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookSearchController extends Controller
{
    public function __construct(
        private IsbnLookupService $isbnLookup,
        private BookSearchService $bookSearch,
    ) {}

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
        ]);

        $results = $this->bookSearch->search(
            $request->string('q')->toString(),
            $request->string('author')->toString() ?: null,
        );

        return response()->json(['results' => $results]);
    }

    public function isbn(string $isbn): JsonResponse
    {
        $result = $this->isbnLookup->lookup($isbn);

        if ($result === null) {
            return response()->json(['message' => 'Book not found.'], 404);
        }

        return response()->json(['result' => $result]);
    }
}
