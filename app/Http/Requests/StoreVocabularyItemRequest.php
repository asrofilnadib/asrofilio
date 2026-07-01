<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVocabularyItemRequest extends FormRequest
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
            'book_id' => ['nullable', 'exists:books,id'],
            'word' => ['required', 'string', 'max:255'],
            'definition' => ['nullable', 'string', 'max:5000'],
            'context' => ['nullable', 'string', 'max:5000'],
            'cfi_location' => ['nullable', 'string', 'max:500'],
        ];
    }
}
