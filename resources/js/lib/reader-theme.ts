import type { ReaderTheme } from '@/types/reader';

export function readerBackground(theme: ReaderTheme): string {
    switch (theme) {
        case 'dark':
            return '#1a1816';
        case 'dark_sepia':
            return '#2d2926';
        case 'sepia':
            return '#f5f0e6';
        case 'light':
        default:
            return '#faf7f0';
    }
}

export function readerSidebarBackground(theme: ReaderTheme): string {
    switch (theme) {
        case 'dark':
            return '#2d2926';
        case 'dark_sepia':
            return '#3d3834';
        case 'sepia':
            return '#ebe5d8';
        case 'light':
        default:
            return '#f0ebe0';
    }
}

export function readerToolbarBackground(theme: ReaderTheme): string {
    const base = readerBackground(theme);

    return `${base}f2`;
}
