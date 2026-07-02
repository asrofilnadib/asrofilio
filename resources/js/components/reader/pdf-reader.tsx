import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Button } from '@/components/ui/button';
import { readerBackground } from '@/lib/reader-theme';
import type { PdfReaderSettings } from '@/types/reader';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

type PdfReaderProps = {
    url: string;
    page?: number;
    onPageChange?: (page: number, totalPages: number) => void;
    onNumPagesChange?: (total: number) => void;
    settings: PdfReaderSettings;
};

type LazyPageProps = {
    pageNumber: number;
    width?: number;
    scale: number;
    scaleMode: PdfReaderSettings['scaleMode'];
    eager?: boolean;
};

function LazyPdfPage({
    pageNumber,
    width,
    scale,
    scaleMode,
    eager = false,
}: LazyPageProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(eager);

    useEffect(() => {
        if (visible) {
            return;
        }

        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            { rootMargin: '500px 0px' },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [visible]);

    const placeholderHeight =
        width && scaleMode === 'fit-width' ? width * 1.414 : 800;

    return (
        <div
            ref={ref}
            data-page={pageNumber}
            className="mb-6 flex justify-center"
        >
            {visible ? (
                <Page
                    pageNumber={pageNumber}
                    width={scaleMode === 'fit-width' ? width : undefined}
                    scale={scaleMode === 'fit-screen' ? scale : undefined}
                    renderTextLayer
                    renderAnnotationLayer
                    className="shadow-lg"
                />
            ) : (
                <div
                    className="rounded-sm bg-black/5"
                    style={{
                        width: width ?? 600,
                        height: placeholderHeight,
                    }}
                />
            )}
        </div>
    );
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
    const [containerWidth, setContainerWidth] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrollingToPage = useRef(false);

    useEffect(() => {
        setCurrentPage(page);
    }, [page]);

    useEffect(() => {
        const container = scrollRef.current;

        if (!container) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(Math.floor(entry.contentRect.width - 48));
        });

        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    const onDocumentLoadSuccess = useCallback(
        ({ numPages: total }: { numPages: number }) => {
            setNumPages(total);
            onNumPagesChange?.(total);
        },
        [onNumPagesChange],
    );

    const goToPage = useCallback(
        (next: number) => {
            const clamped = Math.max(1, Math.min(next, numPages || next));
            setCurrentPage(clamped);
            onPageChange?.(clamped, numPages);
        },
        [numPages, onPageChange],
    );

    useEffect(() => {
        if (settings.readingMode !== 'paged') {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'ArrowLeft') {
                goToPage(currentPage - 1);
            }

            if (event.key === 'ArrowRight') {
                goToPage(currentPage + 1);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, goToPage, settings.readingMode]);

    useEffect(() => {
        if (settings.readingMode !== 'continuous' || !scrollRef.current) {
            return;
        }

        isScrollingToPage.current = true;

        const element = scrollRef.current.querySelector(
            `[data-page="${page}"]`,
        );

        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const timer = setTimeout(() => {
            isScrollingToPage.current = false;
        }, 600);

        return () => clearTimeout(timer);
    }, [page, settings.readingMode]);

    useEffect(() => {
        if (
            settings.readingMode !== 'continuous' ||
            !scrollRef.current ||
            numPages === 0
        ) {
            return;
        }

        const root = scrollRef.current;
        const pageElements = root.querySelectorAll('[data-page]');

        const observer = new IntersectionObserver(
            (entries) => {
                if (isScrollingToPage.current) {
                    return;
                }

                let bestPage = currentPage;
                let bestRatio = 0;

                for (const entry of entries) {
                    const pageNumber = Number(
                        entry.target.getAttribute('data-page'),
                    );

                    if (
                        entry.intersectionRatio > bestRatio &&
                        entry.intersectionRatio >= 0.35
                    ) {
                        bestRatio = entry.intersectionRatio;
                        bestPage = pageNumber;
                    }
                }

                if (bestPage !== currentPage) {
                    setCurrentPage(bestPage);
                    onPageChange?.(bestPage, numPages);
                }
            },
            {
                root,
                threshold: [0, 0.25, 0.5, 0.75, 1],
            },
        );

        pageElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [
        currentPage,
        numPages,
        onPageChange,
        settings.readingMode,
        url,
    ]);

    const bgColor = readerBackground(settings.theme);
    const scale = settings.fontSize / 16;
    const pageWidth =
        containerWidth > 0 ? containerWidth : undefined;

    const pageProps = {
        width: pageWidth,
        scale,
        scaleMode: settings.scaleMode,
    };

    return (
        <div
            className="relative flex h-full flex-col"
            style={{ backgroundColor: bgColor }}
        >
            <div
                ref={scrollRef}
                className="relative flex flex-1 items-start justify-center overflow-auto p-6 md:p-10"
            >
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
                    {settings.readingMode === 'paged' ? (
                        <Page
                            pageNumber={currentPage}
                            width={
                                settings.scaleMode === 'fit-width'
                                    ? pageWidth
                                    : undefined
                            }
                            scale={
                                settings.scaleMode === 'fit-screen'
                                    ? scale
                                    : undefined
                            }
                            renderTextLayer
                            renderAnnotationLayer
                            className="shadow-lg"
                        />
                    ) : (
                        numPages > 0 &&
                        Array.from({ length: numPages }, (_, index) => (
                            <LazyPdfPage
                                key={index + 1}
                                pageNumber={index + 1}
                                eager={index < 2}
                                {...pageProps}
                            />
                        ))
                    )}
                </Document>

                {settings.readingMode === 'paged' && numPages > 0 && (
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
