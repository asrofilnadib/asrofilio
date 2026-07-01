<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property string|null $google_id
 * @property string|null $avatar
 * @property Carbon|null $email_verified_at
 * @property string|null $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role', 'google_id', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role->isAdmin();
    }

    /**
     * @return HasMany<Book, $this>
     */
    public function createdBooks(): HasMany
    {
        return $this->hasMany(Book::class, 'created_by');
    }

    /**
     * @return HasMany<UserBook, $this>
     */
    public function userBooks(): HasMany
    {
        return $this->hasMany(UserBook::class);
    }

    /**
     * @return BelongsToMany<Book, $this>
     */
    public function books(): BelongsToMany
    {
        return $this->belongsToMany(Book::class, 'user_books')
            ->withPivot([
                'status',
                'current_page',
                'progress_percent',
                'cfi_location',
                'rating',
                'review',
                'scheduled_at',
                'started_at',
                'completed_at',
            ])
            ->withTimestamps();
    }

    /**
     * @return HasMany<ReadingSession, $this>
     */
    public function readingSessions(): HasMany
    {
        return $this->hasMany(ReadingSession::class);
    }

    /**
     * @return HasMany<Highlight, $this>
     */
    public function highlights(): HasMany
    {
        return $this->hasMany(Highlight::class);
    }

    /**
     * @return HasMany<Note, $this>
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    /**
     * @return HasMany<VocabularyItem, $this>
     */
    public function vocabularyItems(): HasMany
    {
        return $this->hasMany(VocabularyItem::class);
    }

    /**
     * @return HasMany<Quote, $this>
     */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * @return HasMany<Bookmark, $this>
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * @return HasMany<ActivityLog, $this>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
