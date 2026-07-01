<?php

namespace App\Models;

use Database\Factories\BookChapterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $book_id
 * @property int|null $parent_id
 * @property string $title
 * @property string|null $href
 * @property int $order
 * @property int $level
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['book_id', 'parent_id', 'title', 'href', 'order', 'level'])]
class BookChapter extends Model
{
    /** @use HasFactory<BookChapterFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'level' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * @return BelongsTo<BookChapter, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(BookChapter::class, 'parent_id');
    }

    /**
     * @return HasMany<BookChapter, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(BookChapter::class, 'parent_id')->orderBy('order');
    }
}
