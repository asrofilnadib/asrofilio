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
import { paths } from '@/lib/paths';
import {
    flushReadingProgress,
    saveReadingProgress,
} from '@/lib/reader-progress';
import {
    loadReaderSettings,
    persistReaderSettings,
} from '@/lib/reader-settings-storage';
import type { BookChapter } from '@/types/book';
import type { PdfReaderSettings, ReaderPageProps } from '@/types/reader';

function ReaderShow({
    book,
    userBook,
    chapters: initialChapters,
    bookmarks = [],
    fileUrl,
    fileType,
    initialCfi,
    initialPage,
}: ReaderPageProps) {
    const isPdf = fileType === 'pdf';
    const [chapters, setChapters] = useState<BookChapter[]>(initialChapters);
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

    function goToPage(delta: number) {
        const next = Math.max(
            1,
            Math.min(currentPage + delta, numPages || currentPage + delta),
        );
        setCurrentPage(next);
        setLocation(next);
        savePdfProgress(next, numPages);
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
                onPrevPage={() => goToPage(-1)}
                onNextPage={() => goToPage(1)}
                onAddNote={() => setNoteOpen(true)}
                onAddHighlight={() =>
                    toast.info('Select text to highlight')
                }
                onAddBookmark={() => {
                    const pageRef = isPdf ? `page:${currentPage}` : undefined;

                    router.post(
                        `${paths.userBook(userBook.id)}/bookmark`,
                        {
                            cfi_location:
                                typeof location === 'string'
                                    ? location
                                    : pageRef,
                            page: isPdf ? currentPage : undefined,
                        },
                        {
                            onSuccess: () =>
                                toast.success('Bookmark saved'),
                        },
                    );
                }}
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
