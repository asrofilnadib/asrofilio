<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'author' => ['sometimes', 'required', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'page_count' => ['nullable', 'integer', 'min:1'],
            'language_id' => ['nullable', 'exists:languages,id'],
            'is_public' => ['boolean'],
            'google_books_id' => ['nullable', 'string', 'max:255'],
            'open_library_key' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
            'genre_ids' => ['nullable', 'array'],
            'genre_ids.*' => ['integer', 'exists:genres,id'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            'file' => ['nullable', 'file', 'mimes:epub,pdf', 'max:51200'],
            'cover' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
