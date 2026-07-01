<?php

namespace App\Http\Controllers;

use App\Enums\ReadingStatus;
use App\Models\Book;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $wantsMine = $request->string('scope')->toString() === 'mine'
            || $request->boolean('mine');
        $scope = ($wantsMine && $user) ? 'mine' : 'public';

        $search = $request->string('search')->toString();
        $genreSlug = $request->string('genre')->toString();
        $status = $request->string('status')->toString();

        $query = Book::query()
            ->with(['genres', 'language', 'tags']);

        if ($scope === 'mine') {
            $query->whereHas('userBooks', function ($q) use ($user, $status): void {
                $q->where('user_id', $user->id);

                if ($status !== '' && ReadingStatus::tryFrom($status)) {
                    $q->where('status', $status);
                }
            })->with(['userBooks' => fn ($q) => $q->where('user_id', $user->id)]);
        } else {
            $query->where('is_public', true);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        if ($genreSlug !== '') {
            $query->whereHas('genres', fn ($q) => $q->where('genres.slug', $genreSlug));
        }

        $books = $query
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $genres = Cache::remember(
            'genres.active',
            3600,
            fn () => Genre::active()->get(['id', 'name', 'slug']),
        );

        return Inertia::render('library/index', [
            'books' => $books,
            'genres' => $genres,
            'filters' => [
                'search' => $search,
                'scope' => $scope,
                'genre' => $genreSlug !== '' ? $genreSlug : null,
                'status' => $status !== '' ? $status : null,
            ],
        ]);
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
