<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReadingProgressRequest extends FormRequest
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
            'current_page' => ['nullable', 'integer', 'min:0'],
            'progress_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'cfi_location' => ['nullable', 'string', 'max:500'],
            'pages_read' => ['nullable', 'integer', 'min:0'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
