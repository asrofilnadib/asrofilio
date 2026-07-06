import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { NoteFormModal } from '@/components/modals/note-form-modal';
import { VocabularyFormModal } from '@/components/modals/vocabulary-form-modal';
import { EpubReader } from '@/components/reader/epub-reader';
import { PdfReader } from '@/components/reader/pdf-reader';
import { ReaderToolbar } from '@/components/reader/reader-toolbar';
import {
    TocSidebar,
    type ReaderBookmark,
} from '@/components/reader/toc-sidebar';
import ReaderLayout from '@/layouts/reader-layout';
import {
    findChapterTitle,
    loadPdfOutline,
    parsePageFromHref,
} from '@/lib/pdf-outline';
import {
    applyHighlightToSelection,
    DEFAULT_HIGHLIGHT_COLOR,
    getPdfTextSelection,
} from '@/lib/pdf-highlight';
import { paths } from '@/lib/paths';
import {
    flushReadingProgress,
    saveReadingProgress,
} from '@/lib/reader-progress';
import {
    loadReaderSettings,
    persistReaderSettings,
} from '@/lib/reader-settings-storage';
import type { BookChapter, Highlight } from '@/types/book';
import type { PdfReaderSettings, ReaderPageProps } from '@/types/reader';

function ReaderShow({
    book,
    userBook,
    chapters: initialChapters,
    bookmarks: initialBookmarks = [],
    highlights: initialHighlights = [],
    fileUrl,
    fileType,
    initialCfi,
    initialPage,
}: ReaderPageProps) {
    const isPdf = fileType === 'pdf';
    const [chapters, setChapters] = useState<BookChapter[]>(initialChapters);
    const [bookmarks, setBookmarks] = useState(initialBookmarks);
    const [highlights, setHighlights] =
        useState<Highlight[]>(initialHighlights);
    const [settings, setSettings] = useState<PdfReaderSettings>(() =>
        loadReaderSettings(),
    );
    const [noteOpen, setNoteOpen] = useState(false);
    const [vocabOpen, setVocabOpen] = useState(false);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(initialPage ?? 1);
    const [location, setLocation] = useState<string | number | undefined>(
        initialCfi ?? initialPage ?? 1,
    );

    useEffect(() => {
        setBookmarks(initialBookmarks);
    }, [initialBookmarks]);

    useEffect(() => {
        setHighlights(initialHighlights);
    }, [initialHighlights]);

    useEffect(() => {
        persistReaderSettings(settings);
    }, [settings]);

    useEffect(() => {
        return () => flushReadingProgress();
    }, []);

    useEffect(() => {
        if (!isPdf || chapters.length > 0) {
            return;
        }

        let cancelled = false;

        loadPdfOutline(fileUrl)
            .then((outline) => {
                if (!cancelled && outline.length > 0) {
                    setChapters(outline);
                }
            })
            .catch(() => {
                // Outline is optional; reader still works without it.
            });

        return () => {
            cancelled = true;
        };
    }, [chapters.length, fileUrl, isPdf]);

    const progressPercent = useMemo(() => {
        if (!isPdf || numPages === 0) {
            return userBook.progress_percent;
        }

        return Math.round((currentPage / numPages) * 100);
    }, [currentPage, isPdf, numPages, userBook.progress_percent]);

    const currentLocationRef = useMemo(() => {
        if (isPdf) {
            return `page:${currentPage}`;
        }

        return typeof location === 'string' ? location : null;
    }, [currentPage, isPdf, location]);

    const currentBookmark = useMemo(() => {
        if (!currentLocationRef) {
            return null;
        }

        return (
            bookmarks.find(
                (bookmark) => bookmark.cfi_location === currentLocationRef,
            ) ?? null
        );
    }, [bookmarks, currentLocationRef]);

    const isBookmarked = currentBookmark !== null;

    const activeSection = useMemo(() => {
        if (!isPdf) {
            return null;
        }

        return findChapterTitle(chapters, currentPage);
    }, [chapters, currentPage, isPdf]);

    const savePdfProgress = useCallback(
        (page: number, total: number) => {
            const percent =
                total > 0 ? Math.min(100, Math.round((page / total) * 100)) : 0;

            saveReadingProgress(book.uuid, {
                current_page: page,
                progress_percent: percent,
            });
        },
        [book.uuid],
    );

    const saveEpubProgress = useCallback(
        (cfi: string) => {
            saveReadingProgress(book.uuid, {
                cfi_location: cfi,
                status: 'in_progress',
            });
        },
        [book.uuid],
    );

    function handleLocationChange(cfi: string) {
        setLocation(cfi);
        saveEpubProgress(cfi);
    }

    function handlePageChange(page: number, total: number) {
        setCurrentPage(page);
        setLocation(page);
        savePdfProgress(page, total);
    }

    function handleChapterSelect(chapter: BookChapter) {
        if (isPdf) {
            const page = parsePageFromHref(chapter.href);

            if (page) {
                setCurrentPage(page);
                setLocation(page);
                savePdfProgress(page, numPages);
            }
        } else if (chapter.href) {
            setLocation(chapter.href);
            saveEpubProgress(chapter.href);
        }
    }

    function handleBookmarkSelect(bookmark: ReaderBookmark) {
        const page = parsePageFromHref(bookmark.cfi_location);

        if (page) {
            setCurrentPage(page);
            setLocation(page);
            savePdfProgress(page, numPages);
        } else if (bookmark.cfi_location) {
            setLocation(bookmark.cfi_location);
            saveEpubProgress(bookmark.cfi_location);
        }
    }

    const navigatePage = useCallback(
        (delta: number) => {
            const next = Math.max(
                1,
                Math.min(currentPage + delta, numPages || currentPage + delta),
            );
            setCurrentPage(next);
            setLocation(next);
            savePdfProgress(next, numPages);
        },
        [currentPage, numPages, savePdfProgress],
    );

    useEffect(() => {
        if (!isPdf) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target;

            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                (target instanceof HTMLElement && target.isContentEditable)
            ) {
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                navigatePage(-1);
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                navigatePage(1);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPdf, navigatePage]);

    function handleAddHighlight() {
        if (!isPdf) {
            toast.info('Select text to highlight');

            return;
        }

        const selection = getPdfTextSelection(currentPage);

        if (!selection) {
            toast.info('Select text in the page first, then tap highlight');

            return;
        }

        router.post(
            paths.highlights,
            {
                book_id: book.id,
                text: selection.text,
                cfi_start: selection.cfiStart,
                cfi_end: selection.cfiEnd,
                color: DEFAULT_HIGHLIGHT_COLOR,
                chapter_title: activeSection,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    applyHighlightToSelection(DEFAULT_HIGHLIGHT_COLOR);
                    toast.success('Highlight saved');
                    router.reload({ only: ['highlights'] });
                },
                onError: () => toast.error('Could not save highlight'),
            },
        );
    }

    function handleToggleBookmark() {
        if (currentBookmark) {
            router.delete(paths.bookmark(currentBookmark.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setBookmarks((previous) =>
                        previous.filter(
                            (bookmark) => bookmark.id !== currentBookmark.id,
                        ),
                    );
                    toast.success('Bookmark removed');
                },
                onError: () => toast.error('Could not remove bookmark'),
            });

            return;
        }

        const pageRef = isPdf ? `page:${currentPage}` : undefined;
        const cfiLocation =
            typeof location === 'string' ? location : pageRef;

        if (!cfiLocation) {
            toast.error('Could not determine reading position');

            return;
        }

        router.post(
            paths.userBookBookmark(userBook.id),
            {
                cfi_location: cfiLocation,
                page: isPdf ? currentPage : undefined,
                chapter_title: activeSection,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Bookmark saved');
                    router.reload({ only: ['bookmarks'] });
                },
                onError: () => toast.error('Could not save bookmark'),
            },
        );
    }

    return (
        <>
            <Head title={`Reading: ${book.title}`} />

            <ReaderToolbar
                book={book}
                activeSection={activeSection}
                progressPercent={progressPercent}
                currentPage={currentPage}
                totalPages={numPages}
                isPdf={isPdf}
                settings={settings}
                onSettingsChange={setSettings}
                onPrevPage={() => navigatePage(-1)}
                onNextPage={() => navigatePage(1)}
                onAddNote={() => setNoteOpen(true)}
                onAddHighlight={handleAddHighlight}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={isBookmarked}
            />

            <div className="flex flex-1 overflow-hidden">
                {(isPdf || chapters.length > 0) && (
                    <TocSidebar
                        chapters={chapters}
                        bookmarks={bookmarks}
                        theme={settings.theme}
                        activePage={isPdf ? currentPage : undefined}
                        activeHref={
                            !isPdf && typeof location === 'string'
                                ? location
                                : isPdf
                                  ? `page:${currentPage}`
                                  : undefined
                        }
                        onSelect={handleChapterSelect}
                        onBookmarkSelect={handleBookmarkSelect}
                    />
                )}

                <div className="relative flex-1 overflow-hidden">
                    {!isPdf ? (
                        <EpubReader
                            url={fileUrl}
                            location={location}
                            onLocationChange={handleLocationChange}
                            settings={settings}
                        />
                    ) : (
                        <PdfReader
                            url={fileUrl}
                            page={currentPage}
                            onPageChange={handlePageChange}
                            onNumPagesChange={setNumPages}
                            settings={settings}
                            highlights={highlights}
                        />
                    )}
                </div>
            </div>

            <NoteFormModal
                open={noteOpen}
                onOpenChange={setNoteOpen}
                bookId={book.id}
                userBookId={userBook.id}
                cfiLocation={
                    typeof location === 'string' ? location : undefined
                }
            />

            <VocabularyFormModal
                open={vocabOpen}
                onOpenChange={setVocabOpen}
                bookId={book.id}
                cfiLocation={
                    typeof location === 'string' ? location : undefined
                }
            />
        </>
    );
}

ReaderShow.layout = (page: ReactNode) => <ReaderLayout>{page}</ReaderLayout>;

export default ReaderShow;
