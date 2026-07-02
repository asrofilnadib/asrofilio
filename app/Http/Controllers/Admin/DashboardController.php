<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private AdminDashboardService $dashboard,
    ) {}

    public function index(Request $request): Response
    {
        $usersLimit = $this->dashboard->resolveTableLimit(
            $request->string('users_limit')->toString() ?: null,
        );
        $booksLimit = $this->dashboard->resolveTableLimit(
            $request->string('books_limit')->toString() ?: null,
        );
        $activityLimit = $this->dashboard->resolveTableLimit(
            $request->string('activity_limit')->toString() ?: null,
        );

        return Inertia::render('admin/dashboard', [
            'stats' => $this->dashboard->getStats(),
            'booksAddedChart' => $this->dashboard->getBooksAddedChart(),
            'usersRegisteredChart' => $this->dashboard->getUsersRegisteredChart(),
            'activityChart' => $this->dashboard->getActivityChart(),
            'contentOverviewChart' => $this->dashboard->getContentOverviewChart(),
            'recentUsers' => $this->dashboard->getRecentUsersTable($usersLimit),
            'recentBooks' => $this->dashboard->getRecentBooksTable($booksLimit),
            'recentActivity' => $this->dashboard->getRecentActivityTable($activityLimit),
            'tableLimits' => [
                'users_limit' => $usersLimit === null ? 'all' : (string) $usersLimit,
                'books_limit' => $booksLimit === null ? 'all' : (string) $booksLimit,
                'activity_limit' => $activityLimit === null ? 'all' : (string) $activityLimit,
            ],
            'tableTotals' => $this->dashboard->getTableTotals(),
        ]);
    }
}
