<?php

namespace App\Http\Requests\Admin;

use App\Rules\ValidBookFile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('staged_upload_id')) {
            $this->merge([
                'staged_upload_id' => trim($this->string('staged_upload_id')->toString()) ?: null,
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
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
            'file' => [
                Rule::excludeIf(fn () => ! $this->hasFile('file')),
                'nullable',
                'file',
                'max:51200',
                new ValidBookFile,
            ],
            'staged_upload_id' => ['nullable', 'uuid'],
            'cover' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
