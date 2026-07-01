<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class InspirationalQuoteService
{
    /**
     * @var list<string>
     */
    private const THEMES = [
        'reading',
        'philosophy',
        'history',
        'wisdom',
        'learning',
    ];

    /**
     * @var array<string, list<string>>
     */
    private const THEME_KEYWORDS = [
        'reading' => ['read', 'book', 'library', 'literature', 'page', 'story', 'write'],
        'philosophy' => ['philosoph', 'truth', 'virtue', 'socrates', 'plato', 'aristotle', 'exist'],
        'history' => ['history', 'past', 'future', 'time', 'world', 'age', 'century'],
        'wisdom' => ['wisdom', 'wise', 'mind', 'think', 'know', 'understand', 'intelligence'],
        'learning' => ['learn', 'education', 'study', 'teach', 'student', 'knowledge', 'grow'],
    ];

    /**
     * @var list<string>
     */
    private const RELEVANT_AUTHORS = [
        'plato',
        'aristotle',
        'socrates',
        'seneca',
        'marcus aurelius',
        'epictetus',
        'confucius',
        'einstein',
        'emerson',
        'thoreau',
        'churchill',
        'roosevelt',
        'lincoln',
        'mandela',
        'twain',
        'wilde',
        'shaw',
        'orwell',
        'tolkien',
        'c. s. lewis',
        'montaigne',
        'kant',
        'nietzsche',
        'buddha',
        'lao tzu',
    ];

    /**
     * @var list<array{text: string, author: string}>
     */
    private const FALLBACK_QUOTES = [
        [
            'text' => 'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
            'author' => 'George R.R. Martin',
        ],
        [
            'text' => 'The more that you read, the more things you will know. The more that you learn, the more places you\'ll go.',
            'author' => 'Dr. Seuss',
        ],
        [
            'text' => 'Knowing yourself is the beginning of all wisdom.',
            'author' => 'Aristotle',
        ],
        [
            'text' => 'Study the past if you would define the future.',
            'author' => 'Confucius',
        ],
        [
            'text' => 'The only true wisdom is in knowing you know nothing.',
            'author' => 'Socrates',
        ],
    ];

    /**
     * @return array{text: string, author: string, theme: string}
     */
    public function get(): array
    {
        $bucket = intdiv(time(), 1800);

        /** @var array{text: string, author: string, theme: string} */
        return Cache::remember(
            "inspirational_quote.{$bucket}",
            1800,
            fn (): array => $this->resolveQuote($bucket),
        );
    }

    /**
     * @return array{text: string, author: string, theme: string}
     */
    private function resolveQuote(int $bucket): array
    {
        $theme = self::THEMES[$bucket % count(self::THEMES)];
        $quotes = $this->fetchQuotes();

        if ($quotes === []) {
            return $this->fallbackQuote($bucket, $theme);
        }

        $themed = $this->filterByTheme($quotes, $theme);
        $relevant = $this->filterRelevant($themed !== [] ? $themed : $quotes);

        $pool = $relevant !== [] ? $relevant : $quotes;
        $index = $bucket % count($pool);
        $selected = $pool[$index];

        return [
            'text' => $selected['q'],
            'author' => $selected['a'],
            'theme' => $theme,
        ];
    }

    /**
     * @return list<array{q: string, a: string}>
     */
    private function fetchQuotes(): array
    {
        try {
            $response = Http::timeout(8)
                ->acceptJson()
                ->get('https://zenquotes.io/api/quotes');

            if (! $response->successful()) {
                return [];
            }

            /** @var mixed $payload */
            $payload = $response->json();

            if (! is_array($payload)) {
                return [];
            }

            return collect($payload)
                ->filter(fn ($quote): bool => is_array($quote)
                    && is_string($quote['q'] ?? null)
                    && is_string($quote['a'] ?? null)
                    && $quote['q'] !== ''
                    && $quote['a'] !== '')
                ->map(fn (array $quote): array => [
                    'q' => $quote['q'],
                    'a' => $quote['a'],
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * @param  list<array{q: string, a: string}>  $quotes
     * @return list<array{q: string, a: string}>
     */
    private function filterByTheme(array $quotes, string $theme): array
    {
        $keywords = self::THEME_KEYWORDS[$theme] ?? [];

        return array_values(array_filter(
            $quotes,
            fn (array $quote): bool => $this->matchesKeywords($quote, $keywords),
        ));
    }

    /**
     * @param  list<array{q: string, a: string}>  $quotes
     * @return list<array{q: string, a: string}>
     */
    private function filterRelevant(array $quotes): array
    {
        return array_values(array_filter($quotes, function (array $quote): bool {
            $author = Str::lower($quote['a']);

            foreach (self::RELEVANT_AUTHORS as $name) {
                if (str_contains($author, $name)) {
                    return true;
                }
            }

            $allKeywords = array_merge(...array_values(self::THEME_KEYWORDS));

            return $this->matchesKeywords($quote, $allKeywords);
        }));
    }

    /**
     * @param  array{q: string, a: string}  $quote
     * @param  list<string>  $keywords
     */
    private function matchesKeywords(array $quote, array $keywords): bool
    {
        $haystack = Str::lower($quote['q'].' '.$quote['a']);

        foreach ($keywords as $keyword) {
            if (str_contains($haystack, Str::lower($keyword))) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array{text: string, author: string, theme: string}
     */
    private function fallbackQuote(int $bucket, string $theme): array
    {
        $quote = self::FALLBACK_QUOTES[$bucket % count(self::FALLBACK_QUOTES)];

        return [
            'text' => $quote['text'],
            'author' => $quote['author'],
            'theme' => $theme,
        ];
    }
}
