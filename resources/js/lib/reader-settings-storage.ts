import {
    defaultPdfReaderSettings,
    type PdfReaderSettings,
} from '@/types/reader';

const STORAGE_KEY = 'asrofilio-reader-settings';

export function loadReaderSettings(): PdfReaderSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return defaultPdfReaderSettings;
        }

        return {
            ...defaultPdfReaderSettings,
            ...(JSON.parse(raw) as Partial<PdfReaderSettings>),
        };
    } catch {
        return defaultPdfReaderSettings;
    }
}

export function persistReaderSettings(settings: PdfReaderSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
