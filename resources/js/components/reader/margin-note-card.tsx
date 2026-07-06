import { Check, MoreVertical, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { readerBorderColor } from '@/lib/reader-theme';
import { cn } from '@/lib/utils';
import type { User as AuthUser } from '@/types/auth';
import type { Note } from '@/types/book';
import type { ReaderTheme } from '@/types/reader';

type MarginNoteCardProps = {
    note: Note;
    user: AuthUser;
    isEditing: boolean;
    isActive?: boolean;
    processing?: boolean;
    theme?: ReaderTheme;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onEdit: () => void;
    onSave: (content: string) => void;
    onCancelEdit: () => void;
    onDelete: () => void;
};

function formatNoteTimestamp(value: string): string {
    const date = new Date(value);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const time = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (isToday) {
        return `${time} Hari ini`;
    }

    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function MarginNoteCard({
    note,
    user,
    isEditing,
    isActive = false,
    processing = false,
    theme = 'sepia',
    onClick,
    onMouseEnter,
    onMouseLeave,
    onEdit,
    onSave,
    onCancelEdit,
    onDelete,
}: MarginNoteCardProps) {
    const [editContent, setEditContent] = useState(note.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const borderColor = readerBorderColor(theme);

    useEffect(() => {
        if (isEditing) {
            setEditContent(note.content);
            textareaRef.current?.focus();
        }
    }, [isEditing, note.content]);

    return (
        <div
            className={cn(
                'pointer-events-auto absolute right-3 left-1 rounded-xl border bg-card/95 p-3 shadow-sm backdrop-blur-sm transition-shadow',
                isActive && 'ring-2 ring-primary/30',
            )}
            style={{
                top: `${note.anchor_percent ?? 10}%`,
                borderColor,
            }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    onClick?.();
                }
            }}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
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
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatNoteTimestamp(note.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground"
                        aria-label="Mark resolved"
                    >
                        <Check className="size-3.5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <MoreVertical className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onEdit();
                                }}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDelete();
                                }}
                            >
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isEditing ? (
                <div
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                >
                    <Textarea
                        ref={textareaRef}
                        value={editContent}
                        onChange={(event) => setEditContent(event.target.value)}
                        rows={3}
                        className="min-h-[72px] resize-none text-sm"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={onCancelEdit}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="h-8"
                            onClick={() => onSave(editContent)}
                            disabled={processing || !editContent.trim()}
                        >
                            {processing ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {note.content}
                </p>
            )}
        </div>
    );
}

export { MarginNoteCard };
