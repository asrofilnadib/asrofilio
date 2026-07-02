<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\LogsActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLanguageRequest;
use App\Http\Requests\Admin\UpdateLanguageRequest;
use App\Models\Language;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LanguageController extends Controller
{
    use LogsActivity;

    public function index(): Response
    {
        $this->authorize('viewAny', Language::class);

        $languages = Language::query()->orderBy('name')->get();

        return Inertia::render('admin/languages/index', [
            'languages' => $languages,
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Language::class);

        return redirect()->route('admin.languages.index');
    }

    public function store(StoreLanguageRequest $request): RedirectResponse
    {
        $this->authorize('create', Language::class);

        $language = Language::create($request->validated());
        $this->logCreated($language);

        return redirect()->route('admin.languages.index')->with('success', 'Language created successfully.');
    }

    public function edit(Language $language): RedirectResponse
    {
        $this->authorize('update', $language);

        return redirect()->route('admin.languages.index');
    }

    public function update(UpdateLanguageRequest $request, Language $language): RedirectResponse
    {
        $this->authorize('update', $language);

        $language->update($request->validated());
        $this->logUpdated($language);

        return redirect()->route('admin.languages.index')->with('success', 'Language updated successfully.');
    }

    public function destroy(Language $language): RedirectResponse
    {
        $this->authorize('delete', $language);

        $this->logDeleted($language);
        $language->delete();

        return redirect()->route('admin.languages.index')->with('success', 'Language deleted successfully.');
    }
}
