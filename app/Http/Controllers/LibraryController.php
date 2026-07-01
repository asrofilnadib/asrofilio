<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Services\LibraryBrowseService;
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

        $userBook = null;
        if ($request->user()) {
            $userBook = $book->userBooks()
                ->where('user_id', $request->user()->id)
                ->first();
        }

        return Inertia::render('library/show', [
            'book' => $book,
            'userBook' => $userBook,
        ]);
    }
}
