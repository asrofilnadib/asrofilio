<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookmarkRequest;
use App\Models\Bookmark;
use App\Models\UserBook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function store(StoreBookmarkRequest $request, UserBook $userBook): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $userBook);

        $user = $request->user();
        $validated = $request->validated();
        $cfiLocation = $validated['cfi_location'];

        $bookmark = Bookmark::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'book_id' => $userBook->book_id,
                'cfi_location' => $cfiLocation,
            ],
            [
                'user_book_id' => $userBook->id,
                'label' => $validated['label'] ?? $this->defaultLabel($validated),
                'chapter_title' => $validated['chapter_title'] ?? null,
            ],
        );

        if ($request->wantsJson()) {
            return response()->json(['bookmark' => $bookmark->fresh()]);
        }

        return back()->with('success', 'Bookmark saved.');
    }

    public function destroy(Request $request, Bookmark $bookmark): JsonResponse|RedirectResponse
    {
        $this->authorize('delete', $bookmark);

        $bookmark->delete();

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('success', 'Bookmark removed.');
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function defaultLabel(array $validated): string
    {
        if (isset($validated['page'])) {
            return 'Page '.$validated['page'];
        }

        return 'Bookmark';
    }
}
