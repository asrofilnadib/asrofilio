<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Book;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users' => User::query()->count(),
                'books' => Book::query()->count(),
                'user_books' => UserBook::query()->count(),
                'recent_activity' => ActivityLog::query()
                    ->with('user:id,name')
                    ->latest()
                    ->limit(10)
                    ->get(),
            ],
        ]);
    }
}
