<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHighlightRequest;
use App\Http\Requests\UpdateHighlightRequest;
use App\Models\Highlight;
use App\Models\UserBook;
use Illuminate\Http\JsonResponse;
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
            ->with('book:id,uuid,title,author,cover_path,metadata')
            ->when($request->filled('book_id'), fn ($q) => $q->where('book_id', $request->integer('book_id')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('highlights/index', [
            'highlights' => $highlights,
            'filters' => ['book_id' => $request->integer('book_id') ?: null],
        ]);
    }

    public function store(StoreHighlightRequest $request): JsonResponse|RedirectResponse
    {
        $this->authorize('create', Highlight::class);

        $user = $request->user();
        $userBook = UserBook::query()
            ->where('user_id', $user->id)
            ->where('book_id', $request->integer('book_id'))
            ->first();

        $highlight = Highlight::create([
            ...$request->validated(),
            'user_id' => $user->id,
            'user_book_id' => $userBook?->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['highlight' => $highlight]);
        }

        return back()->with('success', 'Highlight saved.');
    }

    public function update(UpdateHighlightRequest $request, Highlight $highlight): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $highlight);

        $highlight->update($request->validated());

        if ($request->wantsJson()) {
            return response()->json(['highlight' => $highlight->fresh()]);
        }

        return back()->with('success', 'Highlight updated.');
    }

    public function destroy(Request $request, Highlight $highlight): JsonResponse|RedirectResponse
    {
        $this->authorize('delete', $highlight);

        $highlight->delete();

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('success', 'Highlight deleted.');
    }
}
