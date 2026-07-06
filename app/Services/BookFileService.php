<?php

namespace App\Services;

use App\Enums\BookFileType;
use App\Models\Book;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;

class BookFileService
{
    /** @var list<string> */
    private const PDF_MIMES = [
        'application/pdf',
        'application/x-pdf',
    ];

    /** @var list<string> */
    private const EPUB_MIMES = [
        'application/epub+zip',
        'application/epub',
        'application/x-epub+zip',
    ];

    /**
     * @return array{path: string, type: BookFileType}
     */
    public function storeUploadedFile(UploadedFile $file, ?Book $book = null): array
    {
        $type = $this->detectFileType($file);
        $directory = $book !== null ? 'books/'.$book->id : 'books/uploads/'.Str::uuid();
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === '') {
            $extension = $type === BookFileType::Pdf ? 'pdf' : 'epub';
        }

        $filename = Str::uuid().'.'.$extension;
        $path = $file->storeAs($directory, $filename, 'local');

        return [
            'path' => $path,
            'type' => $type,
        ];
    }

    public function isAllowedUpload(UploadedFile $file): bool
    {
        try {
            $this->detectFileType($file);

            return true;
        } catch (InvalidArgumentException) {
            return false;
        }
    }

    public function detectFileType(UploadedFile $file): BookFileType
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = strtolower($file->getMimeType() ?? '');

        if ($extension === 'pdf' || in_array($mime, self::PDF_MIMES, true) || $this->startsWithPdfMagic($file)) {
            return BookFileType::Pdf;
        }

        if ($extension === 'epub' || in_array($mime, self::EPUB_MIMES, true)) {
            return BookFileType::Epub;
        }

        throw new InvalidArgumentException('Unsupported book file type.');
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

    private function startsWithPdfMagic(UploadedFile $file): bool
    {
        $handle = fopen($file->getRealPath(), 'rb');

        if ($handle === false) {
            return false;
        }

        $header = fread($handle, 4);
        fclose($handle);

        return $header === '%PDF';
    }
}
