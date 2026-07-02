import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
    onPageChange?: (page: number, totalPages: number) => void;
    onNumPagesChange?: (total: number) => void;
    settings: TextSettings;
};

function readerBackground(theme: TextSettings['theme']): string {
    if (theme === 'dark') {
        return '#1a1816';
    }

    if (theme === 'sepia') {
        return '#f5f0e6';
    }

    return '#faf7f0';
}

function PdfReader({
    url,
    page = 1,
    onPageChange,
    onNumPagesChange,
    settings,
}: PdfReaderProps) {
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(page);

    useEffect(() => {
        setCurrentPage(page);
    }, [page]);

    const onDocumentLoadSuccess = useCallback(
        ({ numPages: total }: { numPages: number }) => {
            setNumPages(total);
            onNumPagesChange?.(total);
        },
        [onNumPagesChange],
    );

    function goToPage(next: number) {
        const clamped = Math.max(1, Math.min(next, numPages || next));
        setCurrentPage(clamped);
        onPageChange?.(clamped, numPages);
    }

    const bgColor = readerBackground(settings.theme);
    const scale = settings.fontSize / 16;

    return (
        <div
            className="relative flex h-full flex-col"
            style={{ backgroundColor: bgColor }}
        >
            <div className="relative flex flex-1 items-start justify-center overflow-auto p-6 md:p-10">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <p className="text-muted-foreground">Loading PDF…</p>
                    }
                    error={
                        <p className="text-destructive">Failed to load PDF.</p>
                    }
                >
                    <Page
                        pageNumber={currentPage}
                        scale={scale}
                        renderTextLayer
                        renderAnnotationLayer
                        className="shadow-lg"
                    />
                </Document>

                {numPages > 0 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full opacity-80 shadow-md backdrop-blur-sm"
                            disabled={currentPage <= 1}
                            onClick={() => goToPage(currentPage - 1)}
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full opacity-80 shadow-md backdrop-blur-sm"
                            disabled={currentPage >= numPages}
                            onClick={() => goToPage(currentPage + 1)}
                        >
                            <ChevronRight className="size-5" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export { PdfReader };
