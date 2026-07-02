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
        return Inertia::render('admin/dashboard', [
            'stats' => $this->dashboard->getStats(),
            'booksAddedChart' => $this->dashboard->getBooksAddedChart(),
            'usersRegisteredChart' => $this->dashboard->getUsersRegisteredChart(),
            'activityChart' => $this->dashboard->getActivityChart(),
            'contentOverviewChart' => $this->dashboard->getContentOverviewChart(),
            'recentUsers' => $this->dashboard->getRecentUsersTable(),
            'recentBooks' => $this->dashboard->getRecentBooksTable(),
            'recentActivity' => $this->dashboard->getRecentActivityTable(),
        ]);
    }
}
