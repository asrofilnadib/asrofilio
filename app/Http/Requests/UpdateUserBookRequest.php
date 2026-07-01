<?php

namespace App\Http\Requests;

use App\Enums\ReadingStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserBookRequest extends FormRequest
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
            'status' => ['sometimes', Rule::enum(ReadingStatus::class)],
            'current_page' => ['sometimes', 'integer', 'min:0'],
            'progress_percent' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'cfi_location' => ['nullable', 'string', 'max:500'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:5000'],
            'scheduled_at' => ['nullable', 'date'],
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
        ];
    }
}
