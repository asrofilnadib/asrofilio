<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookCoverController extends Controller
{
    public function show(Request $request, Book $book): StreamedResponse
    {
        if ($request->user()) {
            $this->authorize('view', $book);
        } elseif (! $book->is_public) {
            abort(403);
        }

        if ($book->cover_path === null || ! Storage::disk('local')->exists($book->cover_path)) {
            abort(404);
        }

        return Storage::disk('local')->response($book->cover_path);
    }
}
