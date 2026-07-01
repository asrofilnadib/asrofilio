<?php

namespace App\Http\Requests\Admin;

use App\Models\Language;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLanguageRequest extends FormRequest
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
        /** @var Language $language */
        $language = $this->route('language');

        return [
            'code' => ['sometimes', 'required', 'string', 'max:10', Rule::unique('languages', 'code')->ignore($language->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
