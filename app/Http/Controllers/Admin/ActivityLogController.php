<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ActivityLog::class);

        $logs = ActivityLog::query()
            ->with(['user:id,name,email', 'subject'])
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->integer('user_id')))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/logs/index', [
            'logs' => $logs,
            'filters' => [
                'action' => $request->string('action')->toString() ?: null,
                'user_id' => $request->integer('user_id') ?: null,
            ],
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
                ->paginate(25),
        ]);
    }
}
