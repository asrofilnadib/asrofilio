<?php

namespace App\Services;

use App\Enums\BookFileType;
use App\Models\Book;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookStagedUploadService
{
    private const CACHE_PREFIX = 'book_staged_upload:';

    private const TTL_MINUTES = 60;

    public function __construct(
        private BookFileService $bookFileService,
    ) {}

    public function stage(UploadedFile $file, int $userId): string
    {
        $token = (string) Str::uuid();
        $stored = $this->bookFileService->storeUploadedFile($file);

        Cache::put($this->cacheKey($token), [
            'path' => $stored['path'],
            'type' => $stored['type']->value,
            'user_id' => $userId,
        ], now()->addMinutes(self::TTL_MINUTES));

        return $token;
    }

    public function revert(string $token, int $userId): void
    {
        $staged = $this->pull($token, $userId);

        if ($staged === null) {
            return;
        }

        Storage::disk('local')->delete($staged['path']);
    }

    /**
     * @return array{path: string, type: BookFileType}|null
     */
    public function consume(string $token, int $userId): ?array
    {
        $staged = $this->pull($token, $userId);

        if ($staged === null) {
            return null;
        }

        return [
            'path' => $staged['path'],
            'type' => BookFileType::from($staged['type']),
        ];
    }

    public function attachToBook(Book $book, array $staged): void
    {
        $filename = basename($staged['path']);
        $destination = 'books/'.$book->id.'/'.$filename;

        Storage::disk('local')->makeDirectory('books/'.$book->id);
        Storage::disk('local')->move($staged['path'], $destination);

        $book->update([
            'file_path' => $destination,
            'file_type' => $staged['type'],
        ]);
    }

    /**
     * @return array{path: string, type: string, user_id: int}|null
     */
    private function pull(string $token, int $userId): ?array
    {
        if (! Str::isUuid($token)) {
            return null;
        }

        $staged = Cache::pull($this->cacheKey($token));

        if (! is_array($staged) || ($staged['user_id'] ?? null) !== $userId) {
            return null;
        }

        return $staged;
    }

    private function cacheKey(string $token): string
    {
        return self::CACHE_PREFIX.$token;
    }
}
