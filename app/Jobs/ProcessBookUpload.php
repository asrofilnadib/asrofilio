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
        if ($this->book->file_path === null) {
            Log::warning('ProcessBookUpload: book has no file path', ['book_id' => $this->book->id]);

            return;
        }

        $metadata = $this->book->metadata ?? [];

        if (! empty($metadata['cover_url']) && $this->book->cover_path === null) {
            $coverPath = $bookFileService->storeCoverFromUrl($this->book, $metadata['cover_url']);

            if ($coverPath !== null) {
                $this->book->update(['cover_path' => $coverPath]);
            }
        }

        Log::info('ProcessBookUpload: book processed', ['book_id' => $this->book->id]);
    }
}
