<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', ActivityLog::class);

        $logs = ActivityLog::query()
            ->with(['user:id,name,email', 'subject'])
            ->latest()
            ->get();

        return Inertia::render('admin/logs/index', [
            'logs' => $logs,
        ]);
    }

    public function show(ActivityLog $activityLog): Response
    {
        $this->authorize('view', $activityLog);

        $activityLog->load(['user:id,name,email', 'subject']);

        return Inertia::render('admin/logs/index', [
            'selectedLog' => $activityLog,
            'logs' => ActivityLog::query()
                ->with(['user:id,name,email', 'subject'])
                ->latest()
                ->get(),
        ]);
    }
}
