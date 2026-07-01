<?php

namespace App\Policies;

use App\Models\Book;
use App\Models\User;

class BookPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Book $book): bool
    {
        if ($book->is_public) {
            return true;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $book->userBooks()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Book $book): bool
    {
        return $user->isAdmin() || $book->created_by === $user->id;
    }

    public function delete(User $user, Book $book): bool
    {
        return $user->isAdmin() || $book->created_by === $user->id;
    }

    public function restore(User $user, Book $book): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, Book $book): bool
    {
        return $user->isAdmin();
    }
}
