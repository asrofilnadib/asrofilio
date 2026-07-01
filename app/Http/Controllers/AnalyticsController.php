<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analytics,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $days = $request->integer('days', 30);

        return Inertia::render('analytics/index', [
            'stats' => $this->analytics->getUserReadingStats($user),
            'dailyActivity' => $this->analytics->getDailyReadingActivity($user, $days),
            'libraryBreakdown' => $this->analytics->getLibraryStatusBreakdown($user),
            'days' => $days,
        ]);
    }
}
