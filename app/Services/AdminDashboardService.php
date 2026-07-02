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

    /**
     * @return list<array{id: int, name: string, email: string, role: string, library_count: int, joined_at: string}>
     */
    public function getRecentUsersTable(): array
    {
        return User::query()
            ->withCount('userBooks')
            ->latest()
            ->limit(8)
            ->get(['id', 'name', 'email', 'role', 'created_at'])
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'library_count' => $user->user_books_count,
                'joined_at' => $user->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array{id: int, uuid: string, title: string, author: string, library_count: int, added_at: string}>
     */
    public function getRecentBooksTable(): array
    {
        return Book::query()
            ->withCount('userBooks')
            ->latest()
            ->limit(8)
            ->get(['id', 'uuid', 'title', 'author', 'created_at'])
            ->map(fn (Book $book): array => [
                'id' => $book->id,
                'uuid' => $book->uuid,
                'title' => $book->title,
                'author' => $book->author,
                'library_count' => $book->user_books_count,
                'added_at' => $book->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array{id: int, action: string, user_name: string|null, user_id: int|null, created_at: string}>
     */
    public function getRecentActivityTable(): array
    {
        return ActivityLog::query()
            ->with('user:id,name')
            ->latest()
            ->limit(10)
            ->get(['id', 'user_id', 'action', 'created_at'])
            ->map(fn (ActivityLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'user_name' => $log->user?->name,
                'user_id' => $log->user_id,
                'created_at' => $log->created_at->toIso8601String(),
            ])
            ->all();
    }
}
