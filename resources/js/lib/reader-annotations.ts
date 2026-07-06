import { getCsrfToken } from '@/lib/csrf';
import { paths } from '@/lib/paths';
import type { Highlight, Note } from '@/types/book';

export type StoreHighlightPayload = {
    book_id: number;
    text: string;
    cfi_start: string;
    cfi_end: string;
    color: string;
    chapter_title?: string | null;
};

export type StoreNotePayload = {
    book_id: number;
    content: string;
    quoted_text?: string | null;
    anchor_percent?: number | null;
    cfi_location?: string | null;
    chapter_title?: string | null;
};

export type UpdateNotePayload = {
    content: string;
};

function jsonHeaders(): HeadersInit {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': getCsrfToken(),
    };
}

async function requestJson<T>(
    url: string,
    options: RequestInit,
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...jsonHeaders(),
            ...options.headers,
        },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error('Request failed');
    }

    return response.json() as Promise<T>;
}

export function createOptimisticHighlightId(): number {
    return -Date.now();
}

export function isOptimisticHighlightId(id: number): boolean {
    return id < 0;
}

export async function storeHighlight(
    payload: StoreHighlightPayload,
): Promise<Highlight> {
    const data = await requestJson<{ highlight: Highlight }>(paths.highlights, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return data.highlight;
}

export async function storeNote(payload: StoreNotePayload): Promise<Note> {
    const data = await requestJson<{ note: Note }>(paths.notes, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return data.note;
}

export async function updateNote(
    noteId: number,
    payload: UpdateNotePayload,
): Promise<Note> {
    const data = await requestJson<{ note: Note }>(paths.note(noteId), {
        method: 'PUT',
        body: JSON.stringify(payload),
    });

    return data.note;
}

export async function deleteNote(noteId: number): Promise<void> {
    await requestJson<{ ok: boolean }>(paths.note(noteId), {
        method: 'DELETE',
    });
}

export function removeHighlightMark(mark: HTMLElement | null): void {
    if (!mark || !mark.parentNode) {
        return;
    }

    const parent = mark.parentNode;

    while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
    }

    parent.removeChild(mark);
}
