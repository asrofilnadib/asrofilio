import type { ReaderTheme } from '@/types/reader';

export function isDarkReaderTheme(theme: ReaderTheme): boolean {
    return theme === 'dark' || theme === 'dark_sepia';
}

export function readerForeground(theme: ReaderTheme): string {
    return isDarkReaderTheme(theme) ? '#f0ebe0' : '#2d2926';
}

export function readerMutedForeground(theme: ReaderTheme): string {
    return isDarkReaderTheme(theme) ? '#b8b0a6' : '#6b6560';
}

export function readerBorderColor(theme: ReaderTheme): string {
    return isDarkReaderTheme(theme)
        ? 'rgba(240, 235, 224, 0.12)'
        : 'rgba(45, 41, 38, 0.12)';
}

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
