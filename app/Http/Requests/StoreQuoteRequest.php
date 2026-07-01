<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuoteRequest extends FormRequest
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
            'text' => ['required', 'string', 'max:10000'],
            'attribution' => ['nullable', 'string', 'max:255'],
            'cfi_location' => ['nullable', 'string', 'max:500'],
            'is_public' => ['boolean'],
        ];
    }
}
