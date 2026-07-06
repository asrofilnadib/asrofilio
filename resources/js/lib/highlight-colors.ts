export type HighlightColorOption = {
    id: string;
    label: string;
    value: string;
};

export const HIGHLIGHT_COLORS: HighlightColorOption[] = [
    { id: 'yellow', label: 'Yellow', value: '#fef08a' },
    { id: 'purple', label: 'Purple', value: '#c4b5fd' },
    { id: 'green', label: 'Green', value: '#bbf7d0' },
    { id: 'blue', label: 'Blue', value: '#bfdbfe' },
];

export const DEFAULT_HIGHLIGHT_COLOR = HIGHLIGHT_COLORS[0].value;

export function isHighlightColor(color: string): boolean {
    return HIGHLIGHT_COLORS.some((option) => option.value === color);
}
