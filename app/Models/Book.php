<?php

namespace App\Models;

use App\Enums\BookFileType;
use Database\Factories\BookFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property string $title
 * @property string|null $subtitle
 * @property string $author
 * @property string|null $isbn
 * @property string|null $description
 * @property int|null $page_count
 * @property string|null $cover_path
 * @property-read string|null $cover_url
 * @property string|null $file_path
 * @property BookFileType|null $file_type
 * @property int|null $language_id
 * @property bool $is_public
 * @property string|null $google_books_id
 * @property string|null $open_library_key
 * @property array<string, mixed>|null $metadata
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'title',
    'subtitle',
    'author',
    'isbn',
    'description',
    'page_count',
    'cover_path',
    'file_path',
    'file_type',
    'language_id',
    'is_public',
    'google_books_id',
    'open_library_key',
    'metadata',
    'created_by',
])]
class Book extends Model
{
    /** @use HasFactory<BookFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $appends = [
        'cover_url',
    ];

    protected static function booted(): void
    {
        static::creating(function (Book $book): void {
            if ($book->uuid === null) {
                $book->uuid = static::generateUniqueCode();
            }
        });

        static::deleting(function (Book $book): void {
            $book->userBooks()->delete();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = Str::lower(Str::random(8));
        } while (static::withTrashed()->where('uuid', $code)->exists());

        return $code;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'file_type' => BookFileType::class,
            'metadata' => 'array',
            'is_public' => 'boolean',
            'page_count' => 'integer',
        ];
    }

    /**
     * @return Attribute<?string, never>
     */
    protected function coverUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            if ($this->cover_path !== null && Storage::disk('local')->exists($this->cover_path)) {
                if ($this->uuid !== null) {
                    return route('books.cover', $this);
                }

                return null;
            }

            if (is_array($this->metadata) && ! empty($this->metadata['cover_url'])) {
                return $this->metadata['cover_url'];
            }

            return null;
        });
    }

    /**
     * @return BelongsTo<Language, $this>
     */
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsToMany<Genre, $this>
     */
    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    /**
     * @return MorphToMany<Tag, $this>
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * @return HasMany<BookChapter, $this>
     */
    public function chapters(): HasMany
    {
        return $this->hasMany(BookChapter::class)->orderBy('order');
    }

    /**
     * @return HasMany<UserBook, $this>
     */
    public function userBooks(): HasMany
    {
        return $this->hasMany(UserBook::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_books')
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
}
