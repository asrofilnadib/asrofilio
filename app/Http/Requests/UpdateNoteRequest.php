<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
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
            'content' => ['sometimes', 'required', 'string', 'max:10000'],
            'cfi_location' => ['nullable', 'string', 'max:500'],
            'chapter_title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
