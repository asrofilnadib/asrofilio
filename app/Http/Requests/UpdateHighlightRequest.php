<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHighlightRequest extends FormRequest
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
            'text' => ['sometimes', 'required', 'string', 'max:10000'],
            'cfi_start' => ['sometimes', 'required', 'string', 'max:500'],
            'cfi_end' => ['nullable', 'string', 'max:500'],
            'color' => ['sometimes', 'required', 'string', 'max:20'],
            'note' => ['nullable', 'string', 'max:5000'],
            'chapter_title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
