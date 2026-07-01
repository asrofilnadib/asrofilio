<?php

namespace App\Models;

use App\Enums\ReadingStatus;
use Database\Factories\UserBookFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $book_id
 * @property ReadingStatus $status
 * @property int $current_page
 * @property int $progress_percent
 * @property string|null $cfi_location
 * @property int|null $rating
 * @property string|null $review
 * @property Carbon|null $scheduled_at
 * @property Carbon|null $started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'book_id',
    'status',
    'current_page',
    'progress_percent',
    'cfi_location',
    'rating',
    'review',
    'scheduled_at',
    'started_at',
    'completed_at',
])]
class UserBook extends Model
{
    /** @use HasFactory<UserBookFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ReadingStatus::class,
            'current_page' => 'integer',
            'progress_percent' => 'integer',
            'rating' => 'integer',
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
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
     * @return HasMany<Bookmark, $this>
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }
}
