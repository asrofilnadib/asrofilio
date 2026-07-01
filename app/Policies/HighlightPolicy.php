<?php

namespace App\Policies;

use App\Models\Highlight;
use App\Models\User;

class HighlightPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Highlight $highlight): bool
    {
        return $user->id === $highlight->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Highlight $highlight): bool
    {
        return $user->id === $highlight->user_id;
    }

    public function delete(User $user, Highlight $highlight): bool
    {
        return $user->id === $highlight->user_id;
    }
}
