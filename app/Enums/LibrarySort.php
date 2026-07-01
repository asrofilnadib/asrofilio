<?php

namespace App\Enums;

use App\Models\Book;
use Illuminate\Database\Eloquent\Builder;

enum LibrarySort: string
{
    case Newest = 'newest';
    case Oldest = 'oldest';
    case TitleAsc = 'title_asc';
    case TitleDesc = 'title_desc';
    case AuthorAsc = 'author_asc';
    case AuthorDesc = 'author_desc';

    /**
     * @param  Builder<Book>  $query
     */
    public function applyTo(Builder $query): void
    {
        match ($this) {
            self::Newest => $query->latest(),
            self::Oldest => $query->oldest(),
            self::TitleAsc => $query->orderBy('title'),
            self::TitleDesc => $query->orderByDesc('title'),
            self::AuthorAsc => $query->orderBy('author'),
            self::AuthorDesc => $query->orderByDesc('author'),
        };
    }
}
