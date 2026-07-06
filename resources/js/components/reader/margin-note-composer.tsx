import { User } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { readerBorderColor } from '@/lib/reader-theme';
import { cn } from '@/lib/utils';
import type { User as AuthUser } from '@/types/auth';
import type { ReaderTheme } from '@/types/reader';

type MarginNoteComposerProps = {
    user: AuthUser;
    content: string;
    quotedText?: string;
    anchorPercent: number;
    processing?: boolean;
    theme?: ReaderTheme;
    onContentChange: (content: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

function MarginNoteComposer({
    user,
    content,
    quotedText,
    anchorPercent,
    processing = false,
    theme = 'sepia',
    onContentChange,
    onSubmit,
    onCancel,
}: MarginNoteComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const borderColor = readerBorderColor(theme);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onSubmit();
        }
    }

    return (
        <div
            className="pointer-events-auto absolute right-3 left-1 rounded-xl border bg-card p-3 shadow-md"
            style={{
                top: `${anchorPercent}%`,
                borderColor,
            }}
        >
            <div className="mb-2 flex items-center gap-2">
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt=""
                        className="size-7 shrink-0 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="size-4" />
                    </div>
                )}
                <span className="truncate text-sm font-medium">{user.name}</span>
            </div>

            {quotedText ? (
                <p className="mb-2 line-clamp-2 text-xs italic text-muted-foreground">
                    &ldquo;{quotedText}&rdquo;
                </p>
            ) : null}

            <Textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Tulis komentar…"
                className={cn(
                    'min-h-[72px] resize-none border-primary/40 text-sm focus-visible:ring-primary/30',
                )}
            />

            <div className="mt-2 flex justify-end gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-primary"
                    onClick={onCancel}
                    disabled={processing}
                >
                    Batal
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className="h-8"
                    onClick={onSubmit}
                    disabled={processing || !content.trim()}
                >
                    {processing ? 'Menyimpan…' : 'Komentar'}
                </Button>
            </div>
        </div>
    );
}

export { MarginNoteComposer };
