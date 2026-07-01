<?php

namespace App\Services;

use App\Enums\ReadingStatus;
use App\Models\User;
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
            ->where('status', ReadingStatus::Completed)
            ->whereBetween('completed_at', [$from, $to])
            ->count();

        $booksInProgress = $user->userBooks()
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
}
