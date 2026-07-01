<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Book;
use App\Models\Highlight;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Support\Carbon;

class AdminDashboardService
{
    /**
     * @return array<string, int>
     */
    public function getStats(): array
    {
        return [
            'total_books' => Book::query()->count(),
            'total_users' => User::query()->count(),
            'total_highlights' => Highlight::query()->count(),
            'total_user_books' => UserBook::query()->count(),
            'recent_activity_count' => ActivityLog::query()
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];
    }

    /**
     * @return list<array{month: string, count: int}>
     */
    public function getBooksAddedChart(): array
    {
        return Book::query()
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->get(['created_at'])
            ->groupBy(fn (Book $book): string => $book->created_at->format('M Y'))
            ->map(fn ($group, string $month): array => [
                'month' => $month,
                'count' => $group->count(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{month: string, count: int}>
     */
    public function getUsersRegisteredChart(): array
    {
        return User::query()
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->get(['created_at'])
            ->groupBy(fn (User $user): string => $user->created_at->format('M Y'))
            ->map(fn ($group, string $month): array => [
                'month' => $month,
                'count' => $group->count(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{date: string, count: int}>
     */
    public function getActivityChart(): array
    {
        return ActivityLog::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(7)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row): array => [
                'date' => Carbon::parse($row->date)->format('M j'),
                'count' => (int) $row->count,
            ])
            ->all();
    }

    /**
     * @return list<array{name: string, y: int}>
     */
    public function getContentOverviewChart(): array
    {
        return [
            ['name' => 'Books', 'y' => Book::query()->count()],
            ['name' => 'Users', 'y' => User::query()->count()],
            ['name' => 'Highlights', 'y' => Highlight::query()->count()],
            ['name' => 'Library links', 'y' => UserBook::query()->count()],
        ];
    }
}
