<?php

namespace App\Models;

use Database\Factories\HighlightFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $book_id
 * @property int|null $user_book_id
 * @property string $text
 * @property string $cfi_start
 * @property string|null $cfi_end
 * @property string $color
 * @property string|null $note
 * @property string|null $chapter_title
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'book_id',
    'user_book_id',
    'text',
    'cfi_start',
    'cfi_end',
    'color',
    'note',
    'chapter_title',
])]
class Highlight extends Model
{
    /** @use HasFactory<HighlightFactory> */
    use HasFactory;

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
     * @return BelongsTo<UserBook, $this>
     */
    public function userBook(): BelongsTo
    {
        return $this->belongsTo(UserBook::class);
    }
}
