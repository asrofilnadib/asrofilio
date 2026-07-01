<?php

namespace App\Services;

use App\Enums\ReadingStatus;
use App\Models\Book;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class LibraryBrowseService
{
    /**
     * @return array{
     *     books: LengthAwarePaginator,
     *     genres: Collection<int, Genre>,
     *     counts: array{mine: int, public: int},
     *     filters: array{
     *         search: string|null,
     *         scope: 'mine'|'public',
     *         genres: list<string>|null,
     *         status: string|null
     *     }
     * }
     */
    public function browse(Request $request, ?string $forcedScope = null): array
    {
        $user = $request->user();
        $wantsMine = $request->string('scope')->toString() === 'mine'
            || $request->boolean('mine');
        $scope = $forcedScope ?? (($wantsMine && $user) ? 'mine' : 'public');

        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $selectedGenres = $this->resolveSelectedGenres($request);

        $query = Book::query()
            ->with(['genres', 'language', 'tags']);

        if ($user) {
            $query->with(['userBooks' => fn ($q) => $q->where('user_id', $user->id)]);
        }

        if ($scope === 'mine') {
            $query->whereHas('userBooks', function ($q) use ($user, $status): void {
                $q->where('user_id', $user->id);

                if ($status !== '' && ReadingStatus::tryFrom($status)) {
                    $q->where('status', $status);
                }
            });
        } else {
            $query->where('is_public', true);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        $genres = $this->getGenres();
        $this->applyGenreFilter($query, $selectedGenres, $genres->count());

        $books = $query
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return [
            'books' => $books,
            'genres' => $genres,
            'counts' => $this->libraryCounts($user),
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'scope' => $scope,
                'genres' => $this->filtersGenresPayload($selectedGenres, $genres->count()),
                'status' => $status !== '' ? $status : null,
            ],
        ];
    }

    /**
     * @return Collection<int, Genre>
     */
    private function getGenres(): Collection
    {
        return Genre::cachedActive();
    }

    /**
     * @return Collection<int, string>
     */
    private function resolveSelectedGenres(Request $request): Collection
    {
        return collect($request->input('genres', []))
            ->filter(fn ($genre): bool => is_string($genre) && $genre !== '')
            ->values();
    }

    /**
     * @param  Builder<Book>  $query
     * @param  Collection<int, string>  $selectedGenres
     */
    private function applyGenreFilter($query, Collection $selectedGenres, int $totalGenres): void
    {
        if ($selectedGenres->isEmpty() || $selectedGenres->count() >= $totalGenres) {
            return;
        }

        $query->whereHas('genres', fn ($q) => $q->whereIn('genres.slug', $selectedGenres));
    }

    /**
     * @param  Collection<int, string>  $selectedGenres
     * @return list<string>|null
     */
    private function filtersGenresPayload(Collection $selectedGenres, int $totalGenres): ?array
    {
        if ($selectedGenres->isEmpty() || $selectedGenres->count() >= $totalGenres) {
            return null;
        }

        return $selectedGenres->all();
    }

    /**
     * @return array{mine: int, public: int}
     */
    private function libraryCounts(?User $user): array
    {
        $publicCount = Book::query()->where('is_public', true)->count();

        $mineCount = 0;
        if ($user) {
            $mineCount = $user->userBooks()
                ->withExistingBook()
                ->count();
        }

        return [
            'mine' => $mineCount,
            'public' => $publicCount,
        ];
    }
}
