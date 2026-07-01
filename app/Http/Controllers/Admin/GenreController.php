<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\LogsActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGenreRequest;
use App\Http\Requests\Admin\UpdateGenreRequest;
use App\Models\Genre;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GenreController extends Controller
{
    use LogsActivity;

    public function index(): Response
    {
        $this->authorize('viewAny', Genre::class);

        $genres = Genre::query()->orderBy('sort_order')->paginate(15);

        return Inertia::render('admin/genres/index', [
            'genres' => $genres,
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Genre::class);

        return redirect()->route('admin.genres.index');
    }

    public function store(StoreGenreRequest $request): RedirectResponse
    {
        $this->authorize('create', Genre::class);

        $genre = Genre::create($request->validated());
        Genre::forgetCache();
        $this->logCreated($genre);

        return redirect()->route('admin.genres.index')->with('success', 'Genre created successfully.');
    }

    public function edit(Genre $genre): RedirectResponse
    {
        $this->authorize('update', $genre);

        return redirect()->route('admin.genres.index');
    }

    public function update(UpdateGenreRequest $request, Genre $genre): RedirectResponse
    {
        $this->authorize('update', $genre);

        $genre->update($request->validated());
        Genre::forgetCache();
        $this->logUpdated($genre);

        return redirect()->route('admin.genres.index')->with('success', 'Genre updated successfully.');
    }

    public function destroy(Genre $genre): RedirectResponse
    {
        $this->authorize('delete', $genre);

        $this->logDeleted($genre);
        $genre->delete();
        Genre::forgetCache();

        return redirect()->route('admin.genres.index')->with('success', 'Genre deleted successfully.');
    }
}
