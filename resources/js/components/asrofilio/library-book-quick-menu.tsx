import { router } from '@inertiajs/react';
import {
    BookMarked,
    Check,
    Highlighter,
    MoreVertical,
    StickyNote,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import type { Book, ReadingStatus, UserBook } from '@/types/book';

const statusOptions: Array<{ value: ReadingStatus; labelKey: 'library_status_unread' | 'library_status_reading' | 'library_status_scheduled' | 'library_status_completed' }> = [
    { value: 'unread', labelKey: 'library_status_unread' },
    { value: 'in_progress', labelKey: 'library_status_reading' },
    { value: 'scheduled', labelKey: 'library_status_scheduled' },
    { value: 'completed', labelKey: 'library_status_completed' },
];

type LibraryBookQuickMenuProps = {
    book: Book;
    userBook: UserBook;
    onOpenHighlights: () => void;
    onOpenNotes: () => void;
    onRemove: () => void;
    className?: string;
};

function LibraryBookQuickMenu({
    book,
    userBook,
    onOpenHighlights,
    onOpenNotes,
    onRemove,
    className,
}: LibraryBookQuickMenuProps) {
    const { t } = useI18n();

    function updateStatus(status: ReadingStatus) {
        router.patch(
            paths.userBook(userBook.id),
            { status },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('library_status_updated')),
            },
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                        'size-8 rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm hover:bg-black/60 hover:text-white',
                        className,
                    )}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                >
                    <MoreVertical className="size-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="line-clamp-1 font-normal text-muted-foreground">
                    {book.title}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <BookMarked className="size-4" />
                        {t('library_reading_status')}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {statusOptions.map(({ value, labelKey }) => (
                            <DropdownMenuItem
                                key={value}
                                onClick={() => updateStatus(value)}
                            >
                                {userBook.status === value ? (
                                    <Check className="size-4 text-primary" />
                                ) : (
                                    <span className="size-4" />
                                )}
                                {t(labelKey)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={onOpenHighlights}>
                    <Highlighter className="size-4" />
                    {t('library_highlights')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenNotes}>
                    <StickyNote className="size-4" />
                    {t('library_notes')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={onRemove}
                >
                    <Trash2 className="size-4" />
                    {t('library_remove')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { LibraryBookQuickMenu };
