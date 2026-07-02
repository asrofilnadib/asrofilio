<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\LogsActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTagRequest;
use App\Http\Requests\Admin\UpdateTagRequest;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    use LogsActivity;

    public function index(): Response
    {
        $this->authorize('viewAny', Tag::class);

        $tags = Tag::query()->withCount('books')->orderBy('name')->get();

        return Inertia::render('admin/tags/index', [
            'tags' => $tags,
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Tag::class);

        return redirect()->route('admin.tags.index');
    }

    public function store(StoreTagRequest $request): RedirectResponse
    {
        $this->authorize('create', Tag::class);

        $tag = Tag::create($request->validated());
        $this->logCreated($tag);

        return redirect()->route('admin.tags.index')->with('success', 'Tag created successfully.');
    }

    public function edit(Tag $tag): RedirectResponse
    {
        $this->authorize('update', $tag);

        return redirect()->route('admin.tags.index');
    }

    public function update(UpdateTagRequest $request, Tag $tag): RedirectResponse
    {
        $this->authorize('update', $tag);

        $tag->update($request->validated());
        $this->logUpdated($tag);

        return redirect()->route('admin.tags.index')->with('success', 'Tag updated successfully.');
    }

    public function destroy(Tag $tag): RedirectResponse
    {
        $this->authorize('delete', $tag);

        $this->logDeleted($tag);
        $tag->delete();

        return redirect()->route('admin.tags.index')->with('success', 'Tag deleted successfully.');
    }
}
