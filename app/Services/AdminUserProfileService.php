<?php

namespace App\Services;

use App\Enums\ReadingStatus;
use App\Models\ActivityLog;
use App\Models\Bookmark;
use App\Models\Highlight;
use App\Models\Note;
use App\Models\User;
use App\Models\UserBook;
use App\Models\VocabularyItem;

class AdminUserProfileService
{
    /**
     * @return array{
     *     stats: array<string, int>,
     *     currently_reading: list<array<string, mixed>>,
     *     library: list<array<string, mixed>>,
     *     highlights: list<array<string, mixed>>,
     *     notes: list<array<string, mixed>>,
     *     vocabulary: list<array<string, mixed>>,
     *     bookmarks: list<array<string, mixed>>,
     *     activity: list<array<string, mixed>>,
     * }
     */
    public function getProfile(User $user): array
    {
        return [
            'stats' => $this->getStats($user),
            'currently_reading' => $this->getCurrentlyReading($user),
            'library' => $this->getLibrary($user),
            'highlights' => $this->getHighlights($user),
            'notes' => $this->getNotes($user),
            'vocabulary' => $this->getVocabulary($user),
            'bookmarks' => $this->getBookmarks($user),
            'activity' => $this->getActivity($user),
        ];
    }

    /**
     * @return array<string, int>
     */
    public function getStats(User $user): array
    {
        return [
            'library_count' => $user->userBooks()->count(),
            'reading_count' => $user->userBooks()->where('status', ReadingStatus::InProgress)->count(),
            'completed_count' => $user->userBooks()->where('status', ReadingStatus::Completed)->count(),
            'highlights_count' => $user->highlights()->count(),
            'notes_count' => $user->notes()->count(),
            'vocabulary_count' => $user->vocabularyItems()->count(),
            'bookmarks_count' => $user->bookmarks()->count(),
            'quotes_count' => $user->quotes()->count(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getCurrentlyReading(User $user): array
    {
        return UserBook::query()
            ->where('user_id', $user->id)
            ->where('status', ReadingStatus::InProgress)
            ->with('book:id,uuid,title,author,cover_path,page_count')
            ->latest('updated_at')
            ->limit(6)
            ->get()
            ->map(fn (UserBook $userBook): array => $this->formatUserBook($userBook))
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getLibrary(User $user): array
    {
        return UserBook::query()
            ->where('user_id', $user->id)
            ->with('book:id,uuid,title,author,cover_path,page_count')
            ->latest('updated_at')
            ->limit(20)
            ->get()
            ->map(fn (UserBook $userBook): array => $this->formatUserBook($userBook))
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getHighlights(User $user): array
    {
        return Highlight::query()
            ->where('user_id', $user->id)
            ->with('book:id,uuid,title,author')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Highlight $highlight): array => [
                'id' => $highlight->id,
                'text' => $highlight->text,
                'color' => $highlight->color,
                'chapter_title' => $highlight->chapter_title,
                'book' => $highlight->book ? [
                    'id' => $highlight->book->id,
                    'uuid' => $highlight->book->uuid,
                    'title' => $highlight->book->title,
                    'author' => $highlight->book->author,
                ] : null,
                'created_at' => $highlight->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getNotes(User $user): array
    {
        return Note::query()
            ->where('user_id', $user->id)
            ->with('book:id,uuid,title,author')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Note $note): array => [
                'id' => $note->id,
                'content' => $note->content,
                'chapter_title' => $note->chapter_title,
                'book' => $note->book ? [
                    'id' => $note->book->id,
                    'uuid' => $note->book->uuid,
                    'title' => $note->book->title,
                    'author' => $note->book->author,
                ] : null,
                'created_at' => $note->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getVocabulary(User $user): array
    {
        return VocabularyItem::query()
            ->where('user_id', $user->id)
            ->with('book:id,uuid,title,author')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (VocabularyItem $item): array => [
                'id' => $item->id,
                'word' => $item->word,
                'definition' => $item->definition,
                'book' => $item->book ? [
                    'id' => $item->book->id,
                    'uuid' => $item->book->uuid,
                    'title' => $item->book->title,
                    'author' => $item->book->author,
                ] : null,
                'created_at' => $item->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getBookmarks(User $user): array
    {
        return Bookmark::query()
            ->where('user_id', $user->id)
            ->with('book:id,uuid,title,author')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Bookmark $bookmark): array => [
                'id' => $bookmark->id,
                'label' => $bookmark->label,
                'chapter_title' => $bookmark->chapter_title,
                'cfi_location' => $bookmark->cfi_location,
                'book' => $bookmark->book ? [
                    'id' => $bookmark->book->id,
                    'uuid' => $bookmark->book->uuid,
                    'title' => $bookmark->book->title,
                    'author' => $bookmark->book->author,
                ] : null,
                'created_at' => $bookmark->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getActivity(User $user): array
    {
        return ActivityLog::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(25)
            ->get(['id', 'action', 'subject_type', 'created_at'])
            ->map(fn (ActivityLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'created_at' => $log->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUserBook(UserBook $userBook): array
    {
        return [
            'id' => $userBook->id,
            'status' => $userBook->status->value,
            'current_page' => $userBook->current_page,
            'progress_percent' => $userBook->progress_percent,
            'started_at' => $userBook->started_at?->toIso8601String(),
            'completed_at' => $userBook->completed_at?->toIso8601String(),
            'updated_at' => $userBook->updated_at->toIso8601String(),
            'book' => $userBook->book ? [
                'id' => $userBook->book->id,
                'uuid' => $userBook->book->uuid,
                'title' => $userBook->book->title,
                'author' => $userBook->book->author,
                'cover_path' => $userBook->book->cover_path,
                'page_count' => $userBook->book->page_count,
            ] : null,
        ];
    }
}
