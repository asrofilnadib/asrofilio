<?php

namespace App\Http\Controllers;

use App\Enums\ReadingStatus;
use App\Http\Requests\StoreUserBookRequest;
use App\Http\Requests\UpdateUserBookRequest;
use App\Models\Book;
use App\Models\UserBook;
use Illuminate\Http\RedirectResponse;

class UserBookController extends Controller
{
    public function store(StoreUserBookRequest $request, Book $book): RedirectResponse
    {
        $this->authorize('view', $book);

        $user = $request->user();
        $validated = $request->validated();
        $status = $validated['status'] ?? ReadingStatus::Unread;

        UserBook::query()->updateOrCreate(
            ['user_id' => $user->id, 'book_id' => $book->id],
            ['status' => $status],
        );

        return back()->with('success', 'Book added to your library.');
    }

    public function update(UpdateUserBookRequest $request, UserBook $userBook): RedirectResponse
    {
        $this->authorize('update', $userBook);

        $data = $request->validated();

        if (isset($data['status'])) {
            $status = $data['status'];

            if ($status === ReadingStatus::InProgress && $userBook->started_at === null) {
                $data['started_at'] = now();
            }

            if ($status === ReadingStatus::Completed && $userBook->completed_at === null) {
                $data['completed_at'] = now();
            }
        }

        $userBook->update($data);

        return back()->with('success', 'Reading status updated.');
    }

    public function destroy(UserBook $userBook): RedirectResponse
    {
        $this->authorize('delete', $userBook);

        $userBook->delete();

        return back()->with('success', 'Book removed from your library.');
    }
}
