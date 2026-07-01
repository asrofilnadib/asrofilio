<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\LogsActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBookRequest;
use App\Http\Requests\Admin\UpdateBookRequest;
use App\Jobs\ProcessBookUpload;
use App\Models\Book;
use App\Models\Genre;
use App\Models\Language;
use App\Models\Tag;
use App\Services\BookFileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    use LogsActivity;

    public function __construct(
        private BookFileService $bookFileService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Book::class);

        $books = Book::query()
            ->with(['language', 'genres', 'creator:id,name'])
            ->when($request->filled('search'), function ($q) use ($request): void {
                $search = $request->string('search')->toString();
                $q->where(function ($q) use ($search): void {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/books/index', [
            'books' => $books,
            'filters' => ['search' => $request->string('search')->toString() ?: null],
            'languages' => Language::query()->orderBy('name')->get(['id', 'code', 'name']),
            'genres' => Genre::active()->get(['id', 'name', 'slug']),
            'tags' => Tag::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Book::class);

        return redirect()->route('admin.books.index');
    }

    public function store(StoreBookRequest $request): RedirectResponse
    {
        $this->authorize('create', Book::class);

        $data = $request->safe()->except(['file', 'cover', 'genre_ids', 'tag_ids']);
        $data['created_by'] = $request->user()->id;

        $book = Book::create($data);

        if ($request->hasFile('file')) {
            $stored = $this->bookFileService->storeUploadedFile($request->file('file'), $book);
            $book->update([
                'file_path' => $stored['path'],
                'file_type' => $stored['type'],
            ]);
        }

        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('books/'.$book->id, 'local');
            $book->update(['cover_path' => $path]);
        }

        if ($request->has('genre_ids')) {
            $book->genres()->sync($request->input('genre_ids', []));
        }

        if ($request->has('tag_ids')) {
            $book->tags()->sync($request->input('tag_ids', []));
        }

        ProcessBookUpload::dispatchSync($book->fresh());
        $this->logCreated($book);

        return redirect()->route('admin.books.index')->with('success', 'Book created successfully.');
    }

    public function show(Book $book): RedirectResponse
    {
        $this->authorize('view', $book);

        return redirect()->route('admin.books.index');
    }

    public function edit(Book $book): RedirectResponse
    {
        $this->authorize('update', $book);

        return redirect()->route('admin.books.index');
    }

    public function update(UpdateBookRequest $request, Book $book): RedirectResponse
    {
        $this->authorize('update', $book);

        $data = $request->safe()->except(['file', 'cover', 'genre_ids', 'tag_ids']);
        $book->update($data);

        if ($request->hasFile('file')) {
            $this->bookFileService->deleteBookFiles($book);
            $stored = $this->bookFileService->storeUploadedFile($request->file('file'), $book);
            $book->update([
                'file_path' => $stored['path'],
                'file_type' => $stored['type'],
            ]);
        }

        if ($request->hasFile('cover')) {
            if ($book->cover_path) {
                Storage::disk('local')->delete($book->cover_path);
            }
            $path = $request->file('cover')->store('books/'.$book->id, 'local');
            $book->update(['cover_path' => $path]);
        }

        if ($request->has('genre_ids')) {
            $book->genres()->sync($request->input('genre_ids', []));
        }

        if ($request->has('tag_ids')) {
            $book->tags()->sync($request->input('tag_ids', []));
        }

        $this->logUpdated($book);

        return redirect()->route('admin.books.index')->with('success', 'Book updated successfully.');
    }

    public function destroy(Book $book): RedirectResponse
    {
        $this->authorize('delete', $book);

        $this->bookFileService->deleteBookFiles($book);
        $this->logDeleted($book);
        $book->delete();

        return redirect()->route('admin.books.index')->with('success', 'Book deleted successfully.');
    }
}
