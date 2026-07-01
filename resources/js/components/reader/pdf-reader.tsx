import { useCallback, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Button } from '@/components/ui/button';
import type { TextSettings } from '@/types/reader';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

type PdfReaderProps = {
    url: string;
    page?: number;
    onPageChange?: (page: number) => void;
    settings: TextSettings;
};

function PdfReader({
    url,
    page = 1,
    onPageChange,
    settings,
}: PdfReaderProps) {
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(page);

    const onDocumentLoadSuccess = useCallback(
        ({ numPages: total }: { numPages: number }) => {
            setNumPages(total);
        },
        [],
    );

    function goToPage(next: number) {
        const clamped = Math.max(1, Math.min(next, numPages || next));
        setCurrentPage(clamped);
        onPageChange?.(clamped);
    }

    const bgColor =
        settings.theme === 'dark'
            ? '#1a1816'
            : settings.theme === 'sepia'
              ? '#f5f0e6'
              : '#ffffff';

    return (
        <div
            className="flex h-full flex-col"
            style={{ backgroundColor: bgColor }}
        >
            <div className="flex flex-1 items-start justify-center overflow-auto p-4">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <p className="text-muted-foreground">Loading PDF…</p>
                    }
                    error={
                        <p className="text-destructive">
                            Failed to load PDF.
                        </p>
                    }
                >
                    <Page
                        pageNumber={currentPage}
                        scale={settings.fontSize / 16}
                        renderTextLayer
                        renderAnnotationLayer
                    />
                </Document>
            </div>
            {numPages > 0 && (
                <div className="flex items-center justify-center gap-4 border-t border-border bg-card/80 px-4 py-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => goToPage(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {numPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= numPages}
                        onClick={() => goToPage(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

export { PdfReader };
