import { paths } from '@/lib/paths';
import type { Highlight, Note } from '@/types/book';

export type BookAnnotations = {
    highlights: Highlight[];
    notes: Note[];
};

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export async function fetchBookAnnotations(
    bookUuid: string,
): Promise<BookAnnotations> {
    const response = await fetch(paths.libraryAnnotations(bookUuid), {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error('Failed to load annotations');
    }

    return response.json() as Promise<BookAnnotations>;
}
