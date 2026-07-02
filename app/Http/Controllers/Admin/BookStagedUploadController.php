<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProcessBookStagedUploadRequest;
use App\Models\Book;
use App\Services\BookStagedUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BookStagedUploadController extends Controller
{
    public function __construct(
        private BookStagedUploadService $stagedUploads,
    ) {}

    public function process(ProcessBookStagedUploadRequest $request): Response
    {
        $this->authorize('create', Book::class);

        $token = $this->stagedUploads->stage(
            $request->file('file'),
            $request->user()->id,
        );

        return response($token, 200)->header('Content-Type', 'text/plain');
    }

    public function revert(Request $request): Response
    {
        $this->authorize('create', Book::class);

        $token = trim($request->getContent());

        if ($token !== '') {
            $this->stagedUploads->revert($token, $request->user()->id);
        }

        return response('', 200);
    }
}
