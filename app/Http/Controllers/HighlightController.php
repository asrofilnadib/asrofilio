<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHighlightRequest;
use App\Http\Requests\UpdateHighlightRequest;
use App\Models\Highlight;
use App\Models\UserBook;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HighlightController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Highlight::class);

        $highlights = $request->user()
            ->highlights()
            ->with('book:id,title,author,cover_path')
            ->when($request->filled('book_id'), fn ($q) => $q->where('book_id', $request->integer('book_id')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('highlights/index', [
            'highlights' => $highlights,
            'filters' => ['book_id' => $request->integer('book_id') ?: null],
        ]);
    }

    public function store(StoreHighlightRequest $request): RedirectResponse
    {
        $this->authorize('create', Highlight::class);

        $user = $request->user();
        $userBook = UserBook::query()
            ->where('user_id', $user->id)
            ->where('book_id', $request->integer('book_id'))
            ->first();

        Highlight::create([
            ...$request->validated(),
            'user_id' => $user->id,
            'user_book_id' => $userBook?->id,
        ]);

        return back()->with('success', 'Highlight saved.');
    }

    public function update(UpdateHighlightRequest $request, Highlight $highlight): RedirectResponse
    {
        $this->authorize('update', $highlight);

        $highlight->update($request->validated());

        return back()->with('success', 'Highlight updated.');
    }

    public function destroy(Highlight $highlight): RedirectResponse
    {
        $this->authorize('delete', $highlight);

        $highlight->delete();

        return back()->with('success', 'Highlight deleted.');
    }
}
