<?php

use App\Models\User;
use App\Services\InspirationalQuoteService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

test('inspirational quote is cached for thirty minutes', function () {
    Cache::flush();

    Http::fake([
        'zenquotes.io/api/quotes' => Http::response([
            [
                'q' => 'Knowing yourself is the beginning of all wisdom.',
                'a' => 'Aristotle',
                'h' => '',
            ],
            [
                'q' => 'Quality means doing it right when no one is looking.',
                'a' => 'Henry Ford',
                'h' => '',
            ],
        ], 200),
    ]);

    $service = app(InspirationalQuoteService::class);

    $first = $service->get();
    $second = $service->get();

    expect($first)->toBe($second);
    Http::assertSentCount(1);
});

test('logged in home includes inspirational quote from zenquotes', function () {
    Cache::flush();

    Http::fake([
        'zenquotes.io/api/quotes' => Http::response([
            [
                'q' => 'Study the past if you would define the future.',
                'a' => 'Confucius',
                'h' => '',
            ],
        ], 200),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('home/index')
            ->has('inspirationalQuote')
            ->where('inspirationalQuote.author', 'Confucius')
        );
});
