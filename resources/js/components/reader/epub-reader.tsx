import { useEffect, useRef } from 'react';
import { ReactReader } from 'react-reader';

import type { TextSettings } from '@/types/reader';

type EpubReaderProps = {
    url: string;
    location?: string | number;
    onLocationChange?: (cfi: string) => void;
    settings: TextSettings;
};

function EpubReader({
    url,
    location,
    onLocationChange,
    settings,
}: EpubReaderProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const themeBg =
            settings.theme === 'dark'
                ? '#1a1816'
                : settings.theme === 'sepia'
                  ? '#f5f0e6'
                  : '#ffffff';
        const themeFg =
            settings.theme === 'dark' ? '#f0ebe0' : '#2d2926';

        container.style.setProperty('--reader-bg', themeBg);
        container.style.setProperty('--reader-fg', themeFg);
    }, [settings.theme]);

    return (
        <div
            ref={containerRef}
            className="h-full w-full [&_.react-reader]:h-full"
            style={
                {
                    '--reader-font-size': `${settings.fontSize}px`,
                    '--reader-line-height': settings.lineHeight,
                    '--reader-font-family':
                        settings.fontFamily === 'serif'
                            ? 'Libre Baskerville, Georgia, serif'
                            : 'Instrument Sans, system-ui, sans-serif',
                } as React.CSSProperties
            }
        >
            <ReactReader
                url={url}
                location={location ?? null}
                locationChanged={(loc: string) => onLocationChange?.(loc)}
                epubOptions={{
                    flow: 'paginated',
                    manager: 'default',
                }}
                getRendition={(rendition) => {
                    rendition.themes.default({
                        body: {
                            background: 'var(--reader-bg) !important',
                            color: 'var(--reader-fg) !important',
                            'font-family': 'var(--reader-font-family) !important',
                            'font-size': 'var(--reader-font-size) !important',
                            'line-height': 'var(--reader-line-height) !important',
                        },
                    });
                }}
            />
        </div>
    );
}

export { EpubReader };
