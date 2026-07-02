import type { Book, BookChapter, BookFileType, UserBook } from '@/types/book';

export type ReaderTheme = 'light' | 'sepia' | 'dark';

export type TextSettings = {
    fontSize: number;
    lineHeight: number;
    fontFamily: 'serif' | 'sans';
    theme: ReaderTheme;
};

export type ReaderPageProps = {
    book: Book;
    userBook: UserBook;
    chapters: BookChapter[];
    bookmarks?: Array<{
        id: number;
        label?: string | null;
        chapter_title?: string | null;
        cfi_location: string;
    }>;
    fileUrl: string;
    fileType: BookFileType;
    initialCfi?: string | null;
    initialPage?: number;
};

export type TocItem = {
    id: number;
    title: string;
    href?: string | null;
    level: number;
    children?: TocItem[];
};

export const defaultTextSettings: TextSettings = {
    fontSize: 18,
    lineHeight: 1.6,
    fontFamily: 'serif',
    theme: 'sepia',
};
