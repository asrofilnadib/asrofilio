<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVocabularyItemRequest;
use App\Http\Requests\UpdateVocabularyItemRequest;
use App\Models\VocabularyItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VocabularyController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', VocabularyItem::class);

        $items = $request->user()
            ->vocabularyItems()
            ->with('book:id,title,author')
            ->when($request->filled('book_id'), fn ($q) => $q->where('book_id', $request->integer('book_id')))
            ->when($request->filled('search'), fn ($q) => $q->where('word', 'like', '%'.$request->string('search').'%'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('vocabulary/index', [
            'items' => $items,
            'filters' => [
                'book_id' => $request->integer('book_id') ?: null,
                'search' => $request->string('search')->toString() ?: null,
            ],
        ]);
    }

    public function store(StoreVocabularyItemRequest $request): RedirectResponse
    {
        $this->authorize('create', VocabularyItem::class);

        VocabularyItem::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Vocabulary item saved.');
    }

    public function update(UpdateVocabularyItemRequest $request, VocabularyItem $vocabularyItem): RedirectResponse
    {
        $this->authorize('update', $vocabularyItem);

        $vocabularyItem->update($request->validated());

        return back()->with('success', 'Vocabulary item updated.');
    }

    public function destroy(VocabularyItem $vocabularyItem): RedirectResponse
    {
        $this->authorize('delete', $vocabularyItem);

        $vocabularyItem->delete();

        return back()->with('success', 'Vocabulary item deleted.');
    }
}
