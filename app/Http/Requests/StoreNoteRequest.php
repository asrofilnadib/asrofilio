<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
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
            'book_id' => ['required', 'exists:books,id'],
            'content' => ['required', 'string', 'max:10000'],
            'quoted_text' => ['nullable', 'string', 'max:10000'],
            'anchor_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'cfi_location' => ['nullable', 'string', 'max:500'],
            'chapter_title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
