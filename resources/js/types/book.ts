export type ReadingStatus =
    | 'unread'
    | 'in_progress'
    | 'scheduled'
    | 'completed';

export type BookFileType = 'epub' | 'pdf';

export type Genre = {
    id: number;
    name: string;
    slug: string;
    sort_order?: number;
    is_active?: boolean;
};

export type Language = {
    id: number;
    code: string;
    name: string;
};

export type Tag = {
    id: number;
    name: string;
    slug: string;
};

export type Book = {
    id: number;
    uuid: string;
    title: string;
    subtitle?: string | null;
    author: string;
    isbn?: string | null;
    description?: string | null;
    page_count?: number | null;
    cover_path?: string | null;
    cover_url?: string | null;
    file_path?: string | null;
    file_url?: string | null;
    file_type?: BookFileType | null;
    language_id?: number | null;
    language?: Language | null;
    is_public: boolean;
    google_books_id?: string | null;
    open_library_key?: string | null;
    metadata?: Record<string, unknown> | null;
    genres?: Genre[];
    tags?: Tag[];
    created_at?: string;
    updated_at?: string;
};

export type UserBook = {
    id: number;
    user_id: number;
    book_id: number;
    status: ReadingStatus;
    current_page: number;
    progress_percent: number;
    cfi_location?: string | null;
    rating?: number | null;
    review?: string | null;
    scheduled_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    updated_at?: string | null;
    book?: Book;
};

export type BookChapter = {
    id: number;
    book_id: number;
    parent_id?: number | null;
    title: string;
    href?: string | null;
    order: number;
    level: number;
    children?: BookChapter[];
};

export type Highlight = {
    id: number;
    user_id: number;
    book_id: number;
    user_book_id?: number | null;
    text: string;
    cfi_start: string;
    cfi_end?: string | null;
    color: string;
    note?: string | null;
    chapter_title?: string | null;
    book?: Book;
    created_at: string;
};

export type Note = {
    id: number;
    user_id: number;
    book_id: number;
    user_book_id?: number | null;
    content: string;
    quoted_text?: string | null;
    anchor_percent?: number | null;
    cfi_location?: string | null;
    chapter_title?: string | null;
    book?: Book;
    created_at: string;
    updated_at: string;
};

export type VocabularyItem = {
    id: number;
    user_id: number;
    book_id?: number | null;
    word: string;
    definition?: string | null;
    context?: string | null;
    cfi_location?: string | null;
    book?: Book | null;
    created_at: string;
};

export type BookSearchSource = 'google_books' | 'open_library';

export type BookSearchResult = {
    title: string;
    subtitle?: string | null;
    author: string;
    isbn?: string | null;
    description?: string | null;
    page_count?: number | null;
    cover_url?: string | null;
    google_books_id?: string | null;
    open_library_key?: string | null;
    published_date?: string | null;
    publisher?: string | null;
    language?: string | null;
    source?: BookSearchSource;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
