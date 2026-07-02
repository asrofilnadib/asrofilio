import type { User } from '@/types/auth';
import type { Book } from '@/types/book';

export type AdminRecentUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    library_count: number;
    joined_at: string;
};

export type AdminRecentBook = {
    id: number;
    uuid: string;
    title: string;
    author: string;
    library_count: number;
    added_at: string;
};

export type AdminRecentActivity = {
    id: number;
    action: string;
    user_name: string | null;
    user_id: number | null;
    created_at: string;
};

export type AdminUserListRow = User & {
    user_books_count: number;
    reading_count: number;
    highlights_count: number;
    notes_count: number;
};

export type AdminUserStats = {
    library_count: number;
    reading_count: number;
    completed_count: number;
    highlights_count: number;
    notes_count: number;
    vocabulary_count: number;
    bookmarks_count: number;
    quotes_count: number;
};

export type AdminUserBookEntry = {
    id: number;
    status: string;
    current_page: number;
    progress_percent: number;
    started_at: string | null;
    completed_at: string | null;
    updated_at: string;
    book: Pick<Book, 'id' | 'uuid' | 'title' | 'author' | 'cover_path' | 'page_count'> | null;
};

export type AdminUserHighlight = {
    id: number;
    text: string;
    color: string;
    chapter_title: string | null;
    book: Pick<Book, 'id' | 'uuid' | 'title' | 'author'> | null;
    created_at: string;
};

export type AdminUserNote = {
    id: number;
    content: string;
    chapter_title: string | null;
    book: Pick<Book, 'id' | 'uuid' | 'title' | 'author'> | null;
    created_at: string;
};

export type AdminUserVocabulary = {
    id: number;
    word: string;
    definition: string | null;
    book: Pick<Book, 'id' | 'uuid' | 'title' | 'author'> | null;
    created_at: string;
};

export type AdminUserBookmark = {
    id: number;
    label: string | null;
    chapter_title: string | null;
    cfi_location: string;
    book: Pick<Book, 'id' | 'uuid' | 'title' | 'author'> | null;
    created_at: string;
};

export type AdminUserActivity = {
    id: number;
    action: string;
    subject_type: string | null;
    created_at: string;
};
