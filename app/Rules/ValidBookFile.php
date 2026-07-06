<?php

namespace App\Rules;

use App\Services\BookFileService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class ValidBookFile implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            $fail('The file field must be a file.');

            return;
        }

        if (! app(BookFileService::class)->isAllowedUpload($value)) {
            $fail('Only PDF and EPUB files are allowed.');
        }
    }
}
