import { Head, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { NoteFormModal } from '@/components/modals/note-form-modal';
import { VocabularyFormModal } from '@/components/modals/vocabulary-form-modal';
import { EpubReader } from '@/components/reader/epub-reader';
import { MarginNotes, type DraftNote } from '@/components/reader/margin-notes';
import { PdfReader } from '@/components/reader/pdf-reader';
import {
    ReaderSidebar,
    type ReaderBookmark,
} from '@/components/reader/reader-sidebar';
import { ReaderToolbar } from '@/components/reader/reader-toolbar';
import {
    SelectionPopover,
    type SelectionPopoverStep,
} from '@/components/reader/selection-popover';
import ReaderLayout from '@/layouts/reader-layout';
import {
    findChapterTitle,
    loadPdfOutline,
    parsePageFromHref,
} from '@/lib/pdf-outline';
import {
    applyHighlightToSelection,
    applyNoteQuoteFromSelection,
    applyQuotedTextMark,
    DEFAULT_NOTE_DRAFT_COLOR,
    DEFAULT_NOTE_QUOTE_COLOR,
    findPageRoot,
    getPdfTextSelection,
    parsePageFromCfi,
    removeHighlightMarkByText,
    removeNoteQuoteMark,
    setNoteQuoteFocus,
    updateHighlightMarkColor,
    updateNoteQuoteMarkId,
    type PdfTextSelection,
} from '@/lib/pdf-highlight';
import { paths } from '@/lib/paths';
import {
    createOptimisticHighlightId,
    deleteBookmark,
    deleteHighlight,
    deleteNote,
    removeHighlightMark,
    storeHighlight,
    storeNote,
    updateBookmarkLabel,
    updateHighlight,
    updateNote,
} from '@/lib/reader-annotations';
import {
    flushReadingProgress,
    saveReadingProgress,
} from '@/lib/reader-progress';
import {
    loadReaderSettings,
    persistReaderSettings,
} from '@/lib/reader-settings-storage';
import type { BookChapter, Highlight, Note } from '@/types/book';
import type { Auth } from '@/types/auth';
import type { PdfReaderSettings, ReaderPageProps } from '@/types/reader';

function ReaderShow({
    book,
    userBook,
    chapters: initialChapters,
    bookmarks: initialBookmarks = [],
    highlights: initialHighlights = [],
    notes: initialNotes = [],
    fileUrl,
    fileType,
    initialCfi,
    initialPage,
}: ReaderPageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isPdf = fileType === 'pdf';
    const readerContainerRef = useRef<HTMLDivElement>(null);
    const [chapters, setChapters] = useState<BookChapter[]>(initialChapters);
    const [bookmarks, setBookmarks] = useState(initialBookmarks);
    const [highlights, setHighlights] =
        useState<Highlight[]>(initialHighlights);
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [settings, setSettings] = useState<PdfReaderSettings>(() =>
        loadReaderSettings(),
    );
    const [noteOpen, setNoteOpen] = useState(false);
    const [draftNote, setDraftNote] = useState<DraftNote | null>(null);
    const [draftContent, setDraftContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
    const [processingNoteId, setProcessingNoteId] = useState<number | null>(
        null,
    );
    const [marginNotesExpanded, setMarginNotesExpanded] = useState(true);
    const [hoveredNoteId, setHoveredNoteId] = useState<number | null>(null);
    const [vocabOpen, setVocabOpen] = useState(false);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(initialPage ?? 1);
    const [location, setLocation] = useState<string | number | undefined>(
        initialCfi ?? initialPage ?? 1,
    );
    const [pendingSelection, setPendingSelection] =
        useState<PdfTextSelection | null>(null);
    const lastPdfSelectionRef = useRef<PdfTextSelection | null>(null);
    const [selectionPopover, setSelectionPopover] = useState<{
        open: boolean;
        x: number;
        y: number;
        step: SelectionPopoverStep;
    }>({
        open: false,
        x: 0,
        y: 0,
        step: 'action',
    });

    useEffect(() => {
        setBookmarks(initialBookmarks);
    }, [initialBookmarks]);

    useEffect(() => {
        setHighlights(initialHighlights);
    }, [initialHighlights]);

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

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

    useEffect(() => {
        if (!isPdf) {
            return;
        }

        const container = readerContainerRef.current;

        if (!container) {
            return;
        }

        function handleMouseUp(event: MouseEvent) {
            const target = event.target as HTMLElement | null;

            if (!target?.closest('.textLayer')) {
                return;
            }

            requestAnimationFrame(() => {
                const selection = getPdfTextSelection(currentPage);

                if (!selection) {
                    setSelectionPopover((current) =>
                        current.open ? { ...current, open: false } : current,
                    );

                    return;
                }

                const range = window.getSelection()?.getRangeAt(0);
                const rect = range?.getBoundingClientRect();

                if (!rect) {
                    return;
                }

                lastPdfSelectionRef.current = selection;
                setPendingSelection(selection);
                setSelectionPopover({
                    open: true,
                    x: rect.right,
                    y: rect.top,
                    step: 'action',
                });
            });
        }

        function handleSelectionChange() {
            const selection = getPdfTextSelection(currentPage);

            if (selection) {
                lastPdfSelectionRef.current = selection;
            }
        }

        container.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            container.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener(
                'selectionchange',
                handleSelectionChange,
            );
        };
    }, [currentPage, isPdf]);

    const focusedNoteId = hoveredNoteId ?? activeNoteId;

    useEffect(() => {
        if (!isPdf) {
            return;
        }

        setNoteQuoteFocus(readerContainerRef.current, focusedNoteId);
    }, [focusedNoteId, isPdf, currentPage, notes]);

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

    const noteCfiLocation = useMemo(() => {
        if (pendingSelection) {
            return pendingSelection.cfiStart;
        }

        if (isPdf) {
            return `page:${currentPage}`;
        }

        return typeof location === 'string' ? location : undefined;
    }, [currentPage, isPdf, location, pendingSelection]);

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

    function closeSelectionPopover() {
        setSelectionPopover((current) => ({ ...current, open: false }));
        setPendingSelection(null);
    }

    function applyNoteQuoteForPage(
        page: number,
        quotedText?: string,
        noteId?: number,
        color: string = DEFAULT_NOTE_QUOTE_COLOR,
    ) {
        if (!quotedText || !readerContainerRef.current) {
            return;
        }

        const pageRoot = findPageRoot(readerContainerRef.current, page);

        if (pageRoot) {
            applyQuotedTextMark(pageRoot, quotedText, noteId, color);
        }
    }

    function openDraftNote(selection?: PdfTextSelection | null) {
        closeSelectionPopover();

        const anchor = selection ?? lastPdfSelectionRef.current;
        const page =
            anchor?.page ??
            parsePageFromCfi(anchor?.cfiStart ?? '') ??
            currentPage;

        setDraftNote({
            quotedText: anchor?.text,
            anchorPercent: anchor?.anchorPercent ?? 10,
            cfiLocation: anchor?.cfiStart ?? `page:${currentPage}`,
        });
        setDraftContent('');
        setEditingNoteId(null);
        setMarginNotesExpanded(true);

        const appliedFromSelection = applyNoteQuoteFromSelection(
            -1,
            DEFAULT_NOTE_DRAFT_COLOR,
        );

        if (!appliedFromSelection && anchor?.text) {
            requestAnimationFrame(() => {
                applyNoteQuoteForPage(
                    page,
                    anchor.text,
                    -1,
                    DEFAULT_NOTE_DRAFT_COLOR,
                );
            });
        }
    }

    function cancelDraftNote() {
        if (readerContainerRef.current) {
            removeNoteQuoteMark(readerContainerRef.current, -1);
        }

        setDraftNote(null);
        setDraftContent('');
        setProcessingNoteId(null);
    }

    async function handleSaveDraftNote() {
        if (!draftNote || !draftContent.trim() || !auth.user) {
            return;
        }

        setProcessingNoteId(-1);

        try {
            const note = await storeNote({
                book_id: book.id,
                content: draftContent.trim(),
                quoted_text: draftNote.quotedText,
                anchor_percent: draftNote.anchorPercent,
                cfi_location: draftNote.cfiLocation,
                chapter_title: activeSection,
            });

            setNotes((previous) => [...previous, note]);

            if (readerContainerRef.current) {
                const updated = readerContainerRef.current.querySelector(
                    `[data-note-id="-1"]`,
                );

                if (updated) {
                    updateNoteQuoteMarkId(
                        readerContainerRef.current,
                        -1,
                        note.id,
                        DEFAULT_NOTE_QUOTE_COLOR,
                    );
                } else {
                    const page =
                        parsePageFromCfi(note.cfi_location ?? '') ??
                        currentPage;
                    applyNoteQuoteForPage(
                        page,
                        note.quoted_text ?? undefined,
                        note.id,
                    );
                }
            }

            cancelDraftNote();
            setActiveNoteId(note.id);
            setMarginNotesExpanded(true);
        } catch {
            toast.error('Gagal menyimpan komentar');
            setProcessingNoteId(null);
        }
    }

    async function handleSaveNoteEdit(noteId: number, content: string) {
        if (!content.trim()) {
            return;
        }

        setProcessingNoteId(noteId);

        try {
            const note = await updateNote(noteId, { content: content.trim() });

            setNotes((previous) =>
                previous.map((item) => (item.id === noteId ? note : item)),
            );
            setEditingNoteId(null);
            setProcessingNoteId(null);
        } catch {
            toast.error('Gagal memperbarui komentar');
            setProcessingNoteId(null);
        }
    }

    async function handleDeleteNote(noteId: number) {
        setProcessingNoteId(noteId);

        try {
            const note = notes.find((item) => item.id === noteId);

            await deleteNote(noteId);
            setNotes((previous) =>
                previous.filter((item) => item.id !== noteId),
            );

            if (readerContainerRef.current && note?.quoted_text) {
                removeNoteQuoteMark(readerContainerRef.current, noteId);
            }

            if (activeNoteId === noteId) {
                setActiveNoteId(null);
            }

            if (editingNoteId === noteId) {
                setEditingNoteId(null);
            }

            if (hoveredNoteId === noteId) {
                setHoveredNoteId(null);
            }

            setProcessingNoteId(null);
        } catch {
            toast.error('Gagal menghapus komentar');
            setProcessingNoteId(null);
        }
    }

    async function handleDeleteBookmark(bookmarkId: number) {
        try {
            await deleteBookmark(bookmarkId);
            setBookmarks((previous) =>
                previous.filter((item) => item.id !== bookmarkId),
            );
            toast.success('Bookmark dihapus');
        } catch {
            toast.error('Gagal menghapus bookmark');
        }
    }

    async function handleSaveBookmarkLabel(
        bookmark: ReaderBookmark,
        label: string,
    ) {
        try {
            const updated = await updateBookmarkLabel(userBook.id, {
                cfi_location: bookmark.cfi_location,
                label,
                chapter_title: bookmark.chapter_title,
            });

            setBookmarks((previous) =>
                previous.map((item) =>
                    item.cfi_location === bookmark.cfi_location
                        ? { ...item, label: updated.label ?? label }
                        : item,
                ),
            );
            toast.success('Bookmark diperbarui');
        } catch {
            toast.error('Gagal memperbarui bookmark');
        }
    }

    async function handleDeleteHighlight(highlightId: number) {
        const highlight = highlights.find((item) => item.id === highlightId);

        try {
            await deleteHighlight(highlightId);
            setHighlights((previous) =>
                previous.filter((item) => item.id !== highlightId),
            );

            if (readerContainerRef.current && highlight?.text) {
                removeHighlightMarkByText(
                    readerContainerRef.current,
                    highlight.text,
                );
            }
        } catch {
            toast.error('Gagal menghapus highlight');
        }
    }

    async function handleHighlightColorChange(
        highlight: Highlight,
        color: string,
    ) {
        try {
            const updated = await updateHighlight(highlight.id, { color });

            setHighlights((previous) =>
                previous.map((item) =>
                    item.id === highlight.id ? updated : item,
                ),
            );

            if (readerContainerRef.current) {
                updateHighlightMarkColor(
                    readerContainerRef.current,
                    highlight.text,
                    color,
                );
            }
        } catch {
            toast.error('Gagal memperbarui highlight');
        }
    }

    function handleNoteEdit(note: Note) {
        const page = parsePageFromCfi(note.cfi_location ?? '');

        if (page) {
            navigateToPage(page);
        }

        setActiveNoteId(note.id);
        setEditingNoteId(note.id);
        setMarginNotesExpanded(true);
        cancelDraftNote();
    }

    function navigateToPage(page: number) {
        setCurrentPage(page);
        setLocation(page);
        savePdfProgress(page, numPages);
    }

    function handleLocationChange(cfi: string) {
        setLocation(cfi);
        saveEpubProgress(cfi);
    }

    function handlePageChange(page: number, total: number) {
        setCurrentPage(page);
        setLocation(page);
        savePdfProgress(page, total);
        closeSelectionPopover();
        cancelDraftNote();
        setEditingNoteId(null);
    }

    function handleChapterSelect(chapter: BookChapter) {
        if (isPdf) {
            const page = parsePageFromHref(chapter.href);

            if (page) {
                navigateToPage(page);
            }
        } else if (chapter.href) {
            setLocation(chapter.href);
            saveEpubProgress(chapter.href);
        }
    }

    function handleBookmarkSelect(bookmark: ReaderBookmark) {
        const page = parsePageFromHref(bookmark.cfi_location);

        if (page) {
            navigateToPage(page);
        } else if (bookmark.cfi_location) {
            setLocation(bookmark.cfi_location);
            saveEpubProgress(bookmark.cfi_location);
        }
    }

    function handleHighlightSelect(highlight: Highlight) {
        const page = parsePageFromCfi(highlight.cfi_start);

        if (page) {
            navigateToPage(page);
        }
    }

    function handleNoteSelect(note: Note) {
        const page = parsePageFromCfi(note.cfi_location ?? '');

        if (page) {
            navigateToPage(page);
            setActiveNoteId(note.id);
            setMarginNotesExpanded(true);
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

    function saveHighlight(color: string, selection: PdfTextSelection) {
        const optimisticId = createOptimisticHighlightId();
        const mark = applyHighlightToSelection(color);

        closeSelectionPopover();

        const optimisticHighlight: Highlight = {
            id: optimisticId,
            user_id: auth.user?.id ?? 0,
            book_id: book.id,
            user_book_id: userBook.id,
            text: selection.text,
            cfi_start: selection.cfiStart,
            cfi_end: selection.cfiEnd,
            color,
            chapter_title: activeSection,
            created_at: new Date().toISOString(),
        };

        setHighlights((previous) => [...previous, optimisticHighlight]);

        storeHighlight({
            book_id: book.id,
            text: selection.text,
            cfi_start: selection.cfiStart,
            cfi_end: selection.cfiEnd,
            color,
            chapter_title: activeSection,
        })
            .then((savedHighlight) => {
                setHighlights((previous) =>
                    previous.map((item) =>
                        item.id === optimisticId ? savedHighlight : item,
                    ),
                );
            })
            .catch(() => {
                removeHighlightMark(mark);
                setHighlights((previous) =>
                    previous.filter((item) => item.id !== optimisticId),
                );
                toast.error('Gagal menyimpan highlight');
            });
    }

    function handleToolbarHighlight() {
        if (!isPdf) {
            toast.info('Select text to highlight');

            return;
        }

        const selection =
            getPdfTextSelection(currentPage) ??
            lastPdfSelectionRef.current;

        if (!selection) {
            toast.info('Select text in the page first');

            return;
        }

        const range = window.getSelection()?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        setPendingSelection(selection);
        setSelectionPopover({
            open: true,
            x: rect?.right ?? window.innerWidth / 2,
            y: rect?.top ?? window.innerHeight / 2,
            step: 'color',
        });
    }

    function handleToolbarNote() {
        if (!isPdf) {
            setNoteOpen(true);

            return;
        }

        const selection =
            getPdfTextSelection(currentPage) ??
            lastPdfSelectionRef.current;

        openDraftNote(selection);
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
                onAddNote={handleToolbarNote}
                onAddHighlight={handleToolbarHighlight}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={isBookmarked}
            />

            <div className="flex flex-1 overflow-hidden">
                {(isPdf || chapters.length > 0) && (
                    <ReaderSidebar
                        chapters={chapters}
                        bookmarks={bookmarks}
                        highlights={highlights}
                        notes={notes}
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
                        onHighlightSelect={handleHighlightSelect}
                        onNoteSelect={handleNoteSelect}
                        onNoteEdit={handleNoteEdit}
                        onNoteDelete={handleDeleteNote}
                        onNoteHover={setHoveredNoteId}
                        activeNoteId={activeNoteId}
                        onBookmarkDelete={handleDeleteBookmark}
                        onBookmarkSaveLabel={handleSaveBookmarkLabel}
                        onHighlightDelete={handleDeleteHighlight}
                        onHighlightColorChange={handleHighlightColorChange}
                    />
                )}

                <div
                    ref={readerContainerRef}
                    className="relative flex-1 overflow-hidden"
                >
                    {!isPdf ? (
                        <EpubReader
                            url={fileUrl}
                            location={location}
                            onLocationChange={handleLocationChange}
                            settings={settings}
                        />
                    ) : (
                        <>
                            <PdfReader
                                url={fileUrl}
                                page={currentPage}
                                onPageChange={handlePageChange}
                                onNumPagesChange={setNumPages}
                                settings={settings}
                                highlights={highlights}
                                notes={notes}
                            />
                            {auth.user ? (
                                <MarginNotes
                                    notes={notes}
                                    currentPage={currentPage}
                                    expanded={marginNotesExpanded}
                                    onExpandedChange={setMarginNotesExpanded}
                                    draftNote={draftNote}
                                    draftContent={draftContent}
                                    editingNoteId={editingNoteId}
                                    activeNoteId={activeNoteId}
                                    processingNoteId={processingNoteId}
                                    user={auth.user}
                                    theme={settings.theme}
                                    onDraftContentChange={setDraftContent}
                                    onSaveDraft={handleSaveDraftNote}
                                    onCancelDraft={cancelDraftNote}
                                    onNoteClick={(note) =>
                                        setActiveNoteId(note.id)
                                    }
                                    onNoteHover={setHoveredNoteId}
                                    onEditNote={(noteId) => {
                                        const note = notes.find(
                                            (item) => item.id === noteId,
                                        );

                                        if (note) {
                                            handleNoteEdit(note);
                                        }
                                    }}
                                    onSaveNote={handleSaveNoteEdit}
                                    onCancelEditNote={() =>
                                        setEditingNoteId(null)
                                    }
                                    onDeleteNote={handleDeleteNote}
                                />
                            ) : null}
                        </>
                    )}
                </div>
            </div>

            <SelectionPopover
                open={selectionPopover.open}
                x={selectionPopover.x}
                y={selectionPopover.y}
                step={selectionPopover.step}
                onChooseHighlight={() =>
                    setSelectionPopover((current) => ({
                        ...current,
                        step: 'color',
                    }))
                }
                onChooseNote={() => {
                    if (!pendingSelection) {
                        return;
                    }

                    openDraftNote(pendingSelection);
                }}
                onColorSelect={(color) => {
                    if (!pendingSelection) {
                        return;
                    }

                    saveHighlight(color, pendingSelection);
                }}
                onClose={closeSelectionPopover}
            />

            {!isPdf ? (
                <NoteFormModal
                    open={noteOpen}
                    onOpenChange={(open) => {
                        setNoteOpen(open);

                        if (!open) {
                            setPendingSelection(null);
                        }
                    }}
                    bookId={book.id}
                    userBookId={userBook.id}
                    cfiLocation={noteCfiLocation}
                    chapterTitle={activeSection ?? undefined}
                    quotedText={pendingSelection?.text}
                    anchorPercent={pendingSelection?.anchorPercent}
                    onSuccess={() => {
                        setPendingSelection(null);
                        router.reload({ only: ['notes'] });
                    }}
                />
            ) : null}

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
