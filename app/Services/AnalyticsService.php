<?php

namespace App\Services;

use App\Enums\ReadingStatus;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * @return array<string, mixed>
     */
    public function getUserReadingStats(User $user, ?Carbon $from = null, ?Carbon $to = null): array
    {
        $from ??= now()->subDays(30)->startOfDay();
        $to ??= now()->endOfDay();

        $sessionsQuery = $user->readingSessions()
            ->whereBetween('started_at', [$from, $to]);

        $totalSeconds = (clone $sessionsQuery)->sum('duration_seconds');
        $totalPages = (clone $sessionsQuery)->sum('pages_read');
        $sessionCount = (clone $sessionsQuery)->count();

        $booksCompleted = $user->userBooks()
            ->withExistingBook()
            ->where('status', ReadingStatus::Completed)
            ->whereBetween('completed_at', [$from, $to])
            ->count();

        $booksInProgress = $user->userBooks()
            ->withExistingBook()
            ->where('status', ReadingStatus::InProgress)
            ->count();

        return [
            'period' => [
                'from' => $from->toIso8601String(),
                'to' => $to->toIso8601String(),
            ],
            'total_reading_seconds' => (int) $totalSeconds,
            'total_pages_read' => (int) $totalPages,
            'session_count' => $sessionCount,
            'books_completed' => $booksCompleted,
            'books_in_progress' => $booksInProgress,
            'average_session_minutes' => $sessionCount > 0
                ? round($totalSeconds / $sessionCount / 60, 1)
                : 0,
        ];
    }

    /**
     * @return array<string, int|float>
     */
    public function getDashboardStats(User $user): array
    {
        $libraryBreakdown = $this->getLibraryStatusBreakdown($user);
        $allTimeSeconds = (int) $user->readingSessions()->sum('duration_seconds');
        $sessionCount = $user->readingSessions()->count();

        $completedQuery = $user->userBooks()
            ->withExistingBook()
            ->where('status', ReadingStatus::Completed)
            ->whereNotNull('completed_at');

        return [
            'library_total' => array_sum($libraryBreakdown),
            'books_completed' => $libraryBreakdown[ReadingStatus::Completed->value],
            'total_reading_seconds' => $allTimeSeconds,
            'books_this_month' => (clone $completedQuery)
                ->whereBetween('completed_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
            'books_this_year' => (clone $completedQuery)
                ->whereBetween('completed_at', [now()->startOfYear(), now()->endOfYear()])
                ->count(),
            'books_all_time' => (clone $completedQuery)->count(),
            'average_session_minutes' => $sessionCount > 0
                ? round($allTimeSeconds / $sessionCount / 60, 1)
                : 0,
        ];
    }

    /**
     * @return Collection<int, object>
     */
    public function getDailyReadingActivity(User $user, int $days = 30): Collection
    {
        return DB::table('reading_sessions')
            ->selectRaw('DATE(started_at) as date, SUM(duration_seconds) as total_seconds, SUM(pages_read) as total_pages, COUNT(*) as session_count')
            ->where('user_id', $user->id)
            ->where('started_at', '>=', now()->subDays($days)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * @return array<string, int>
     */
    public function getLibraryStatusBreakdown(User $user): array
    {
        $counts = $user->userBooks()
            ->withExistingBook()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            ReadingStatus::Unread->value => (int) ($counts[ReadingStatus::Unread->value] ?? 0),
            ReadingStatus::InProgress->value => (int) ($counts[ReadingStatus::InProgress->value] ?? 0),
            ReadingStatus::Scheduled->value => (int) ($counts[ReadingStatus::Scheduled->value] ?? 0),
            ReadingStatus::Completed->value => (int) ($counts[ReadingStatus::Completed->value] ?? 0),
        ];
    }

    /**
     * @return list<array{month: string, count: int}>
     */
    public function getBooksCompletedChart(User $user): array
    {
        return $user->userBooks()
            ->withExistingBook()
            ->where('status', ReadingStatus::Completed)
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', now()->subMonths(12))
            ->get(['completed_at'])
            ->groupBy(fn (UserBook $userBook): string => $userBook->completed_at->format('M Y'))
            ->map(fn (Collection $group, string $month): array => [
                'month' => $month,
                'count' => $group->count(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{text: string, value: int}>
     */
    public function getVocabularyWordCloud(User $user, int $limit = 50): array
    {
        return $user->vocabularyItems()
            ->selectRaw('word, COUNT(*) as value')
            ->groupBy('word')
            ->orderByDesc('value')
            ->limit($limit)
            ->get()
            ->map(fn ($row): array => [
                'text' => $row->word,
                'value' => (int) $row->value,
            ])
            ->all();
    }
}
