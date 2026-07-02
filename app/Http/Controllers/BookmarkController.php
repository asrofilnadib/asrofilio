<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookmarkRequest;
use App\Models\Bookmark;
use App\Models\UserBook;
use Illuminate\Http\RedirectResponse;

class BookmarkController extends Controller
{
    public function store(StoreBookmarkRequest $request, UserBook $userBook): RedirectResponse
    {
        $this->authorize('update', $userBook);

        $user = $request->user();
        $validated = $request->validated();
        $cfiLocation = $validated['cfi_location'];

        Bookmark::query()->updateOrCreate(
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

        return back()->with('success', 'Bookmark saved.');
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
