import { cn } from '@/lib/utils';

type ReadingProgressBarProps = {
    value: number;
    showLabel?: boolean;
    labelPosition?: 'above' | 'inline' | 'below';
    size?: 'sm' | 'md';
    className?: string;
    labelClassName?: string;
    formatLabel?: (value: number) => string;
};

function ReadingProgressBar({
    value,
    showLabel = true,
    labelPosition = 'above',
    size = 'sm',
    className,
    labelClassName,
    formatLabel = (progress) => `${progress}%`,
}: ReadingProgressBarProps) {
    const clamped = Math.min(100, Math.max(0, value));
    const barHeight = size === 'sm' ? 'h-1' : 'h-1.5';

    const label = showLabel ? (
        <span
            className={cn(
                'shrink-0 text-[11px] font-medium text-primary tabular-nums',
                labelClassName,
            )}
        >
            {formatLabel(clamped)}
        </span>
    ) : null;

    const track = (
        <div
            className={cn(
                'reading-progress-track overflow-hidden rounded-full',
                barHeight,
                labelPosition === 'inline' && 'flex-1',
            )}
        >
            <div
                className={cn(
                    'reading-progress-fill h-full rounded-full transition-[width] duration-300',
                )}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );

    if (labelPosition === 'inline') {
        return (
            <div
                className={cn(
                    'flex min-w-0 items-center gap-2',
                    className,
                )}
            >
                {track}
                {label}
            </div>
        );
    }

    return (
        <div className={cn('space-y-1', className)}>
            {labelPosition === 'above' && label}
            {track}
            {labelPosition === 'below' && label}
        </div>
    );
}

export { ReadingProgressBar };
export type { ReadingProgressBarProps };
