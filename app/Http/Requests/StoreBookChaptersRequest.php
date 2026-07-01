<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookChaptersRequest extends FormRequest
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
            'chapters' => ['required', 'array', 'min:1'],
            'chapters.*.title' => ['required', 'string', 'max:255'],
            'chapters.*.href' => ['nullable', 'string', 'max:500'],
            'chapters.*.order' => ['required', 'integer', 'min:0'],
            'chapters.*.level' => ['required', 'integer', 'min:0'],
            'chapters.*.parent_id' => ['nullable', 'integer'],
        ];
    }
}
