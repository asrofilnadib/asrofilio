<?php

namespace App\Http\Requests\Admin\Concerns;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

trait RespondsWithPlainTextErrors
{
    protected function failedValidation(Validator $validator): void
    {
        $message = $validator->errors()->first() ?? 'Validation failed.';

        throw new HttpResponseException(
            response($message, 422)->header('Content-Type', 'text/plain; charset=UTF-8')
        );
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            response('Unauthorized.', 403)->header('Content-Type', 'text/plain; charset=UTF-8')
        );
    }
}
