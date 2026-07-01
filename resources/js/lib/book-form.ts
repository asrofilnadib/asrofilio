import type { Language } from '@/types/book';
import type { BookSearchResult } from '@/types/book';

type BookFormValues = {
    title: string;
    subtitle: string;
    author: string;
    isbn: string;
    description: string;
    page_count: string;
    language_id: string;
    google_books_id: string;
    open_library_key: string;
    cover_url: string;
    is_public: boolean;
};

const emptyFormValues: BookFormValues = {
    title: '',
    subtitle: '',
    author: '',
    isbn: '',
    description: '',
    page_count: '',
    language_id: '',
    google_books_id: '',
    open_library_key: '',
    cover_url: '',
    is_public: false,
};

const languageAliases: Record<string, string> = {
    eng: 'en',
    ind: 'id',
    en: 'en',
    id: 'id',
};

function resolveLanguageId(
    code: string | null | undefined,
    languages: Language[],
): string {
    if (!code) {
        return '';
    }

    const normalized = code.replace(/^\/languages\//, '').toLowerCase();
    const targetCode = languageAliases[normalized] ?? normalized.slice(0, 2);

    const match = languages.find(
        (lang) => lang.code.toLowerCase() === targetCode,
    );

    return match ? String(match.id) : '';
}

function bookToFormValues(
    book: {
        title: string;
        subtitle?: string | null;
        author: string;
        isbn?: string | null;
        description?: string | null;
        page_count?: number | null;
        language_id?: number | null;
        google_books_id?: string | null;
        open_library_key?: string | null;
        is_public?: boolean;
        metadata?: Record<string, unknown> | null;
    },
): BookFormValues {
    return {
        title: book.title,
        subtitle: book.subtitle ?? '',
        author: book.author,
        isbn: book.isbn ?? '',
        description: book.description ?? '',
        page_count: book.page_count?.toString() ?? '',
        language_id: book.language_id?.toString() ?? '',
        google_books_id: book.google_books_id ?? '',
        open_library_key: book.open_library_key ?? '',
        cover_url:
            typeof book.metadata?.cover_url === 'string'
                ? book.metadata.cover_url
                : '',
        is_public: book.is_public ?? false,
    };
}

function searchResultToFormValues(
    result: BookSearchResult,
    languages: Language[],
): BookFormValues {
    return {
        ...emptyFormValues,
        title: result.title,
        subtitle: result.subtitle ?? '',
        author: result.author,
        isbn: result.isbn ?? '',
        description: result.description ?? '',
        page_count: result.page_count?.toString() ?? '',
        language_id: resolveLanguageId(result.language, languages),
        google_books_id: result.google_books_id ?? '',
        open_library_key: result.open_library_key ?? '',
        cover_url: result.cover_url ?? '',
    };
}

export {
    bookToFormValues,
    emptyFormValues,
    searchResultToFormValues,
    type BookFormValues,
};
