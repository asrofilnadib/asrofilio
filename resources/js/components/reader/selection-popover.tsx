import { Highlighter, StickyNote } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { HIGHLIGHT_COLORS } from '@/lib/highlight-colors';
import { cn } from '@/lib/utils';

type SelectionPopoverStep = 'action' | 'color';

type SelectionPopoverProps = {
    open: boolean;
    x: number;
    y: number;
    step: SelectionPopoverStep;
    onChooseHighlight: () => void;
    onChooseNote: () => void;
    onColorSelect: (color: string) => void;
    onClose: () => void;
};

function SelectionPopover({
    open,
    x,
    y,
    step,
    onChooseHighlight,
    onChooseNote,
    onColorSelect,
    onClose,
}: SelectionPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handlePointerDown(event: MouseEvent) {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            ref={popoverRef}
            className="fixed z-50 rounded-lg border border-border bg-card p-1.5 shadow-lg"
            style={{
                top: y,
                left: x,
                transform: 'translate(0, -110%)',
            }}
        >
            {step === 'action' ? (
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2"
                        onClick={onChooseHighlight}
                    >
                        <Highlighter className="size-3.5" />
                        Highlight
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2"
                        onClick={onChooseNote}
                    >
                        <StickyNote className="size-3.5" />
                        Note
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-1 py-0.5">
                    {HIGHLIGHT_COLORS.map((color) => (
                        <button
                            key={color.id}
                            type="button"
                            title={color.label}
                            className={cn(
                                'size-6 rounded-full border border-black/10 transition-transform hover:scale-110',
                            )}
                            style={{ backgroundColor: color.value }}
                            onClick={() => onColorSelect(color.value)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export { SelectionPopover };
export type { SelectionPopoverStep };
