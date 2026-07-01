<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VocabularyItem;

class VocabularyItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, VocabularyItem $vocabularyItem): bool
    {
        return $user->id === $vocabularyItem->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, VocabularyItem $vocabularyItem): bool
    {
        return $user->id === $vocabularyItem->user_id;
    }

    public function delete(User $user, VocabularyItem $vocabularyItem): bool
    {
        return $user->id === $vocabularyItem->user_id;
    }
}
