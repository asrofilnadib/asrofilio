<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Services\LibraryBrowseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    public function __construct(
        private LibraryBrowseService $libraryBrowse,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('library/index', $this->libraryBrowse->browse($request));
    }

    public function show(Request $request, Book $book): Response
    {
        if ($request->user()) {
            $this->authorize('view', $book);
        } elseif (! $book->is_public) {
            abort(403);
        }

        $book->load(['genres', 'language', 'tags', 'chapters']);

        $user = $request->user();
        $userBook = null;
        $highlights = [];
        $notes = [];

        if ($user) {
            $userBook = $book->userBooks()
                ->where('user_id', $user->id)
                ->first();

            if ($userBook) {
                $highlights = $book->highlights()
                    ->where('user_id', $user->id)
                    ->latest()
                    ->get();

                $notes = $book->notes()
                    ->where('user_id', $user->id)
                    ->latest()
                    ->get();
            }
        }

        return Inertia::render('library/show', [
            'book' => $book,
            'userBook' => $userBook,
            'highlights' => $highlights,
            'notes' => $notes,
        ]);
    }

    public function annotations(Request $request, Book $book): JsonResponse
    {
        $this->authorize('view', $book);

        $user = $request->user();
        abort_unless($user !== null, 403);

        $inLibrary = $book->userBooks()
            ->where('user_id', $user->id)
            ->exists();

        abort_unless($inLibrary, 403);

        $highlights = $book->highlights()
            ->where('user_id', $user->id)
            ->latest()
            ->get(['id', 'text', 'color', 'note', 'chapter_title', 'created_at']);

        $notes = $book->notes()
            ->where('user_id', $user->id)
            ->latest()
            ->get(['id', 'content', 'chapter_title', 'created_at']);

        return response()->json([
            'highlights' => $highlights,
            'notes' => $notes,
        ]);
    }
}
