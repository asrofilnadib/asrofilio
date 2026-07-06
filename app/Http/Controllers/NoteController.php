<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Note;
use App\Models\UserBook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Note::class);

        $notes = $request->user()
            ->notes()
            ->with('book:id,uuid,title,author,cover_path,metadata')
            ->when($request->filled('book_id'), fn ($q) => $q->where('book_id', $request->integer('book_id')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('notes/index', [
            'notes' => $notes,
            'filters' => ['book_id' => $request->integer('book_id') ?: null],
        ]);
    }

    public function store(StoreNoteRequest $request): JsonResponse|RedirectResponse
    {
        $this->authorize('create', Note::class);

        $user = $request->user();
        $userBook = UserBook::query()
            ->where('user_id', $user->id)
            ->where('book_id', $request->integer('book_id'))
            ->first();

        $note = Note::create([
            ...$request->validated(),
            'user_id' => $user->id,
            'user_book_id' => $userBook?->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['note' => $note]);
        }

        return back()->with('success', 'Note saved.');
    }

    public function update(UpdateNoteRequest $request, Note $note): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $note);

        $note->update($request->validated());

        if ($request->wantsJson()) {
            return response()->json(['note' => $note->fresh()]);
        }

        return back()->with('success', 'Note updated.');
    }

    public function destroy(Request $request, Note $note): JsonResponse|RedirectResponse
    {
        $this->authorize('delete', $note);

        $note->delete();

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('success', 'Note deleted.');
    }
}
