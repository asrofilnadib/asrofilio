<?php

namespace App\Models;

use Database\Factories\ReadingSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $user_book_id
 * @property int $book_id
 * @property Carbon $started_at
 * @property Carbon|null $ended_at
 * @property int|null $duration_seconds
 * @property int|null $start_page
 * @property int|null $end_page
 * @property int|null $pages_read
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'user_book_id',
    'book_id',
    'started_at',
    'ended_at',
    'duration_seconds',
    'start_page',
    'end_page',
    'pages_read',
])]
class ReadingSession extends Model
{
    /** @use HasFactory<ReadingSessionFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'duration_seconds' => 'integer',
            'start_page' => 'integer',
            'end_page' => 'integer',
            'pages_read' => 'integer',
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
     * @return BelongsTo<UserBook, $this>
     */
    public function userBook(): BelongsTo
    {
        return $this->belongsTo(UserBook::class);
    }

    /**
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
