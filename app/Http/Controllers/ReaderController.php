<?php

namespace App\Http\Controllers;

use App\Enums\ReadingStatus;
use App\Http\Requests\StoreBookChaptersRequest;
use App\Http\Requests\UpdateReadingProgressRequest;
use App\Models\Book;
use App\Models\BookChapter;
use App\Models\ReadingSession;
use App\Models\UserBook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReaderController extends Controller
{
    public function show(Request $request, Book $book): Response
    {
        $this->authorize('view', $book);

        $user = $request->user();
        abort_unless($user !== null, 403);

        $userBook = UserBook::query()->firstOrCreate(
            ['user_id' => $user->id, 'book_id' => $book->id],
            ['status' => ReadingStatus::Unread],
        );

        $book->load(['chapters.children', 'language']);

        $highlights = $book->highlights()
            ->where('user_id', $user->id)
            ->get();

        $bookmarks = $book->bookmarks()
            ->where('user_id', $user->id)
            ->get();

        return Inertia::render('reader/show', [
            'book' => $book,
            'userBook' => $userBook,
            'highlights' => $highlights,
            'bookmarks' => $bookmarks,
            'fileUrl' => route('reader.file', $book),
            'fileType' => $book->file_type?->value ?? 'pdf',
            'chapters' => $book->chapters()
                ->whereNull('parent_id')
                ->with('children')
                ->orderBy('order')
                ->get(),
            'initialPage' => $userBook->current_page ?: 1,
            'initialCfi' => $userBook->cfi_location,
        ]);
    }

    public function file(Request $request, Book $book): StreamedResponse
    {
        $this->authorize('view', $book);
        abort_unless($request->user() !== null, 403);
        abort_unless($book->file_path !== null, 404);

        $disk = Storage::disk('local');

        abort_unless($disk->exists($book->file_path), 404);

        return $disk->response($book->file_path, basename($book->file_path), [
            'Content-Type' => $book->file_type?->value === 'pdf'
                ? 'application/pdf'
                : 'application/epub+zip',
        ]);
    }

    public function updateProgress(UpdateReadingProgressRequest $request, Book $book): JsonResponse
    {
        $this->authorize('view', $book);

        $user = $request->user();
        $userBook = UserBook::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->firstOrFail();

        $data = $request->validated();

        if (isset($data['progress_percent']) && $data['progress_percent'] > 0) {
            $data['status'] = $data['progress_percent'] >= 100
                ? ReadingStatus::Completed
                : ReadingStatus::InProgress;

            if ($data['status'] === ReadingStatus::InProgress && $userBook->started_at === null) {
                $data['started_at'] = now();
            }

            if ($data['status'] === ReadingStatus::Completed && $userBook->completed_at === null) {
                $data['completed_at'] = now();
            }
        }

        $userBook->update($data);

        if ($request->filled('duration_seconds') || $request->filled('pages_read')) {
            ReadingSession::create([
                'user_id' => $user->id,
                'user_book_id' => $userBook->id,
                'book_id' => $book->id,
                'started_at' => now()->subSeconds($request->integer('duration_seconds', 0)),
                'ended_at' => now(),
                'duration_seconds' => $request->integer('duration_seconds', 0),
                'pages_read' => $request->integer('pages_read', 0),
                'end_page' => $data['current_page'] ?? $userBook->current_page,
            ]);
        }

        return response()->json(['userBook' => $userBook->fresh()]);
    }

    public function storeChapters(StoreBookChaptersRequest $request, Book $book): JsonResponse
    {
        $this->authorize('update', $book);

        $book->chapters()->delete();

        $chapters = collect($request->validated('chapters'))->map(
            fn (array $chapter) => BookChapter::create([
                'book_id' => $book->id,
                'title' => $chapter['title'],
                'href' => $chapter['href'] ?? null,
                'order' => $chapter['order'],
                'level' => $chapter['level'],
                'parent_id' => $chapter['parent_id'] ?? null,
            ]),
        );

        return response()->json(['chapters' => $chapters]);
    }
}
