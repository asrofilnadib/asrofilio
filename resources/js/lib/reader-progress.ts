import { paths } from '@/lib/paths';

export type ReadingProgressPayload = {
    current_page?: number;
    progress_percent?: number;
    cfi_location?: string;
    status?: string;
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export function saveReadingProgress(
    bookUuid: string,
    payload: ReadingProgressPayload,
): void {
    if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        debounceTimer = null;

        void fetch(paths.readerProgress(bookUuid), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify(payload),
        });
    }, 500);
}

export function flushReadingProgress(): void {
    if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
}
