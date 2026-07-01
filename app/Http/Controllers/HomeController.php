<?php

namespace App\Http\Controllers;

use App\Enums\ReadingStatus;
use App\Models\Book;
use App\Models\UserBook;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private AnalyticsService $analytics,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user) {
            $readingStats = $this->analytics->getUserReadingStats($user);
            $libraryBreakdown = $this->analytics->getLibraryStatusBreakdown($user);

            return Inertia::render('home/index', [
                'stats' => [
                    'total_books' => array_sum($libraryBreakdown),
                    'books_completed' => $libraryBreakdown[ReadingStatus::Completed->value],
                    'reading_streak' => (int) ($readingStats['session_count'] > 0 ? 1 : 0),
                ],
                'currentlyReading' => Inertia::defer(fn () => $user->userBooks()
                    ->withExistingBook()
                    ->with(['book.genres', 'book.language'])
                    ->where('status', ReadingStatus::InProgress)
                    ->latest('updated_at')
                    ->limit(6)
                    ->get()
                    ->map(fn (UserBook $userBook) => [
                        'book' => $userBook->book,
                        'user_book' => $userBook,
                    ])
                    ->values()),
                'recentlyAdded' => Inertia::defer(fn () => $user->userBooks()
                    ->withExistingBook()
                    ->with(['book.genres', 'book.language'])
                    ->latest()
                    ->limit(6)
                    ->get()
                    ->map(fn (UserBook $userBook) => $userBook->book)
                    ->values()),
            ]);
        }

        return Inertia::render('home/index', [
            'recentlyAdded' => Inertia::defer(fn () => Book::query()
                ->where('is_public', true)
                ->with(['genres', 'language'])
                ->latest()
                ->limit(6)
                ->get()),
        ]);
    }
}
