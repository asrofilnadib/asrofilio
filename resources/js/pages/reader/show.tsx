import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { NoteFormModal } from '@/components/modals/note-form-modal';
import { VocabularyFormModal } from '@/components/modals/vocabulary-form-modal';
import { EpubReader } from '@/components/reader/epub-reader';
import { PdfReader } from '@/components/reader/pdf-reader';
import { ReaderToolbar } from '@/components/reader/reader-toolbar';
import { TextSettingsPopover } from '@/components/reader/text-settings-popover';
import { TocSidebar } from '@/components/reader/toc-sidebar';
import ReaderLayout from '@/layouts/reader-layout';
import { paths } from '@/lib/paths';
import {
    defaultTextSettings,
    type ReaderPageProps,
    type TextSettings,
} from '@/types/reader';

function ReaderShow({
    book,
    userBook,
    chapters,
    fileUrl,
    fileType,
    initialCfi,
    initialPage,
}: ReaderPageProps) {
    const [showToc, setShowToc] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] =
        useState<TextSettings>(defaultTextSettings);
    const [noteOpen, setNoteOpen] = useState(false);
    const [vocabOpen, setVocabOpen] = useState(false);
    const [location, setLocation] = useState<string | number | undefined>(
        initialCfi ?? initialPage ?? 1,
    );

    const saveProgress = useCallback(
        (cfiOrPage: string | number) => {
            router.put(
                paths.userBook(userBook.id),
                {
                    cfi_location:
                        typeof cfiOrPage === 'string' ? cfiOrPage : undefined,
                    current_page:
                        typeof cfiOrPage === 'number' ? cfiOrPage : undefined,
                    status: 'in_progress',
                },
                { preserveScroll: true, preserveState: true },
            );
        },
        [userBook.id],
    );

    function handleLocationChange(cfi: string) {
        setLocation(cfi);
        saveProgress(cfi);
    }

    function handlePageChange(page: number) {
        setLocation(page);
        saveProgress(page);
    }

    function handleChapterSelect(chapter: { href?: string | null }) {
        if (chapter.href) {
            setLocation(chapter.href);
        }
        setShowToc(false);
    }

    return (
        <>
            <Head title={`Reading: ${book.title}`} />

            <ReaderToolbar
                book={book}
                showToc={showToc}
                onToggleToc={() => setShowToc(!showToc)}
                onToggleSettings={() => setShowSettings(!showSettings)}
                onAddNote={() => setNoteOpen(true)}
                onAddHighlight={() =>
                    toast.info('Select text to highlight')
                }
                onAddBookmark={() => {
                    router.post(
                        `${paths.userBook(userBook.id)}/bookmark`,
                        {
                            cfi_location:
                                typeof location === 'string'
                                    ? location
                                    : undefined,
                            page:
                                typeof location === 'number'
                                    ? location
                                    : undefined,
                        },
                        {
                            onSuccess: () =>
                                toast.success('Bookmark saved'),
                        },
                    );
                }}
            />

            <div className="flex flex-1 overflow-hidden">
                {showToc && (
                    <TocSidebar
                        chapters={chapters}
                        onSelect={handleChapterSelect}
                    />
                )}

                <div className="relative flex-1 overflow-hidden">
                    {fileType === 'epub' ? (
                        <EpubReader
                            url={fileUrl}
                            location={location}
                            onLocationChange={handleLocationChange}
                            settings={settings}
                        />
                    ) : (
                        <PdfReader
                            url={fileUrl}
                            page={
                                typeof location === 'number'
                                    ? location
                                    : initialPage
                            }
                            onPageChange={handlePageChange}
                            settings={settings}
                        />
                    )}

                    {showSettings && (
                        <div className="absolute top-4 right-4">
                            <TextSettingsPopover
                                settings={settings}
                                onChange={setSettings}
                            />
                        </div>
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
