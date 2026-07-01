<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserBook;

class UserBookPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, UserBook $userBook): bool
    {
        return $user->id === $userBook->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, UserBook $userBook): bool
    {
        return $user->id === $userBook->user_id;
    }

    public function delete(User $user, UserBook $userBook): bool
    {
        return $user->id === $userBook->user_id;
    }
}
