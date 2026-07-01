<?php

namespace App\Jobs;

use App\Models\Book;
use App\Services\BookFileService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessBookUpload implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Book $book,
    ) {}

    public function handle(BookFileService $bookFileService): void
    {
        $metadata = $this->book->metadata ?? [];

        if (! empty($metadata['cover_url']) && $this->book->cover_path === null) {
            $coverPath = $bookFileService->storeCoverFromUrl($this->book, $metadata['cover_url']);

            if ($coverPath !== null) {
                $this->book->update(['cover_path' => $coverPath]);
            }
        }

        if ($this->book->file_path === null) {
            return;
        }

        Log::info('ProcessBookUpload: book processed', ['book_id' => $this->book->id]);
    }
}
