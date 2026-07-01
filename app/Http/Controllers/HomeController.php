<?php

namespace App\Http\Controllers;

use App\Enums\ReadingStatus;
use App\Models\UserBook;
use App\Services\AnalyticsService;
use App\Services\InspirationalQuoteService;
use App\Services\LibraryBrowseService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private AnalyticsService $analytics,
        private InspirationalQuoteService $inspirationalQuotes,
        private LibraryBrowseService $libraryBrowse,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user) {
            return Inertia::render('home/index', [
                'inspirationalQuote' => $this->inspirationalQuotes->get(),
                'stats' => $this->analytics->getDashboardStats($user),
                'currentlyReading' => Inertia::defer(fn () => $user->userBooks()
                    ->withExistingBook()
                    ->with(['book.genres', 'book.language'])
                    ->where('status', ReadingStatus::InProgress)
                    ->latest('updated_at')
                    ->limit(1)
                    ->get()
                    ->map(fn (UserBook $userBook) => [
                        'book' => $userBook->book,
                        'user_book' => $userBook,
                    ])
                    ->values()),
                'recentHighlights' => Inertia::defer(fn () => $user->highlights()
                    ->with('book:id,title,author')
                    ->latest()
                    ->limit(2)
                    ->get()),
                'recentVocabulary' => Inertia::defer(fn () => $user->vocabularyItems()
                    ->with('book:id,title')
                    ->latest()
                    ->limit(2)
                    ->get()),
            ]);
        }

        return Inertia::render('home/index', $this->libraryBrowse->browse($request, 'public'));
    }
}
