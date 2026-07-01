<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;

test('guest cannot search books', function () {
    $this->getJson(route('api.books.search', ['q' => 'alchemist']))
        ->assertUnauthorized();
});

test('authenticated user receives multiple search results from both providers', function () {
    Http::fake([
        'www.googleapis.com/books/v1/volumes*' => Http::response([
            'items' => [
                [
                    'id' => 'google-1',
                    'volumeInfo' => [
                        'title' => 'The Alchemist',
                        'authors' => ['Paulo Coelho'],
                        'industryIdentifiers' => [
                            ['type' => 'ISBN_13', 'identifier' => '9780062315007'],
                        ],
                    ],
                ],
                [
                    'id' => 'google-2',
                    'volumeInfo' => [
                        'title' => 'The Alchemist: A Graphic Novel',
                        'authors' => ['Paulo Coelho'],
                    ],
                ],
            ],
        ]),
        'openlibrary.org/search.json*' => Http::response([
            'docs' => [
                [
                    'key' => '/works/OL79636W',
                    'title' => 'The alchemist',
                    'author_name' => ['Paulo Coelho'],
                    'isbn' => ['9780062315007'],
                    'cover_i' => 12345,
                    'first_publish_year' => 1988,
                ],
                [
                    'key' => '/works/OL99999W',
                    'title' => 'O Alquimista',
                    'author_name' => ['Paulo Coelho'],
                ],
            ],
        ]),
    ]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson(route('api.books.search', ['q' => 'the alchemist paulo']));

    $response->assertOk();
    $response->assertJsonCount(3, 'results');
    $response->assertJsonPath('results.0.source', 'google_books');
    $response->assertJsonPath('results.0.title', 'The Alchemist');
    $response->assertJsonFragment(['source' => 'open_library']);
});

test('search deduplicates results with the same isbn', function () {
    Http::fake([
        'www.googleapis.com/books/v1/volumes*' => Http::response([
            'items' => [
                [
                    'id' => 'google-1',
                    'volumeInfo' => [
                        'title' => 'The Alchemist',
                        'authors' => ['Paulo Coelho'],
                        'industryIdentifiers' => [
                            ['type' => 'ISBN_13', 'identifier' => '9780062315007'],
                        ],
                    ],
                ],
            ],
        ]),
        'openlibrary.org/search.json*' => Http::response([
            'docs' => [
                [
                    'key' => '/works/OL79636W',
                    'title' => 'The alchemist',
                    'author_name' => ['Paulo Coelho'],
                    'isbn' => ['9780062315007'],
                ],
            ],
        ]),
    ]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson(route('api.books.search', ['q' => 'alchemist']));

    $response->assertOk();
    $response->assertJsonCount(1, 'results');
});
