<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\RespondsWithPlainTextErrors;
use App\Rules\ValidBookFile;
use Illuminate\Foundation\Http\FormRequest;

class ProcessBookStagedUploadRequest extends FormRequest
{
    use RespondsWithPlainTextErrors;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:51200', new ValidBookFile],
        ];
    }
}
