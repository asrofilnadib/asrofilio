import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { BookChapter } from '@/types/book';

type TocSidebarProps = {
    chapters: BookChapter[];
    activeHref?: string | null;
    onSelect?: (chapter: BookChapter) => void;
    className?: string;
};

function TocSidebar({
    chapters,
    activeHref,
    onSelect,
    className,
}: TocSidebarProps) {
    function renderChapter(chapter: BookChapter) {
        const isActive = activeHref === chapter.href;

        return (
            <div key={chapter.id}>
                <button
                    type="button"
                    onClick={() => onSelect?.(chapter)}
                    className={cn(
                        'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                        isActive
                            ? 'bg-primary/10 font-medium text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                    style={{ paddingLeft: `${(chapter.level - 1) * 12 + 12}px` }}
                >
                    {chapter.title}
                </button>
                {chapter.children?.map(renderChapter)}
            </div>
        );
    }

    return (
        <aside
            className={cn(
                'flex w-64 shrink-0 flex-col border-r border-border bg-card',
                className,
            )}
        >
            <div className="border-b border-border px-4 py-3">
                <h2 className="font-serif text-sm font-semibold">
                    Table of Contents
                </h2>
            </div>
            <ScrollArea className="flex-1 p-2">
                {chapters.length > 0 ? (
                    chapters.map(renderChapter)
                ) : (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                        No chapters available
                    </p>
                )}
            </ScrollArea>
        </aside>
    );
}

export { TocSidebar };
