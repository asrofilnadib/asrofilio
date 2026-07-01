<?php

namespace App\Services;

use App\Enums\BookFileType;
use App\Models\Book;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookFileService
{
    /**
     * @return array{path: string, type: BookFileType}
     */
    public function storeUploadedFile(UploadedFile $file, ?Book $book = null): array
    {
        $type = $this->detectFileType($file);
        $directory = $book !== null ? 'books/'.$book->id : 'books/uploads/'.Str::uuid();
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'local');

        return [
            'path' => $path,
            'type' => $type,
        ];
    }

    public function detectFileType(UploadedFile $file): BookFileType
    {
        $extension = strtolower($file->getClientOriginalExtension());

        return match ($extension) {
            'pdf' => BookFileType::Pdf,
            default => BookFileType::Epub,
        };
    }

    public function deleteBookFiles(Book $book): void
    {
        if ($book->file_path !== null) {
            Storage::disk('local')->delete($book->file_path);
        }

        if ($book->cover_path !== null) {
            Storage::disk('local')->delete($book->cover_path);
        }
    }

    public function storeCoverFromUrl(Book $book, string $url): ?string
    {
        $contents = @file_get_contents($url);

        if ($contents === false) {
            return null;
        }

        $extension = pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'jpg';
        $path = 'books/'.$book->id.'/cover.'.$extension;

        Storage::disk('local')->put($path, $contents);

        return $path;
    }
}
