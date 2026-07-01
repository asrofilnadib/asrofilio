<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreLibraryBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'page_count' => ['nullable', 'integer', 'min:1'],
            'cover_url' => ['nullable', 'string', 'max:2048'],
            'google_books_id' => ['nullable', 'string', 'max:255'],
            'open_library_key' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $hasIsbn = $this->filled('isbn');
            $hasTitleAndAuthor = $this->filled('title') && $this->filled('author');

            if (! $hasIsbn && ! $hasTitleAndAuthor) {
                $validator->errors()->add(
                    'title',
                    'Provide a title and author, or an ISBN to look up the book.',
                );
            }
        });
    }
}
