<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuoteRequest;
use App\Http\Requests\UpdateQuoteRequest;
use App\Models\Quote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Quote::class);

        $quotes = $request->user()
            ->quotes()
            ->with('book:id,title,author,cover_path')
            ->when($request->filled('book_id'), fn ($q) => $q->where('book_id', $request->integer('book_id')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('quotes/index', [
            'quotes' => $quotes,
            'filters' => ['book_id' => $request->integer('book_id') ?: null],
        ]);
    }

    public function store(StoreQuoteRequest $request): RedirectResponse
    {
        $this->authorize('create', Quote::class);

        Quote::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Quote saved.');
    }

    public function update(UpdateQuoteRequest $request, Quote $quote): RedirectResponse
    {
        $this->authorize('update', $quote);

        $quote->update($request->validated());

        return back()->with('success', 'Quote updated.');
    }

    public function destroy(Quote $quote): RedirectResponse
    {
        $this->authorize('delete', $quote);

        $quote->delete();

        return back()->with('success', 'Quote deleted.');
    }
}
