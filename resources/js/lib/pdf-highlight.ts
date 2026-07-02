import type { Highlight } from '@/types/book';

export type PdfTextSelection = {
    text: string;
    page: number;
    cfiStart: string;
    cfiEnd: string;
};

const DEFAULT_HIGHLIGHT_COLOR = '#fef08a';

function hashText(text: string): string {
    let hash = 0;

    for (let index = 0; index < text.length; index++) {
        hash = (hash << 5) - hash + text.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash).toString(36);
}

export function buildPdfCfi(page: number, text: string): string {
    return `page:${page}:text:${hashText(text)}`;
}

export function parsePageFromCfi(cfi: string): number | null {
    const match = cfi.match(/^page:(\d+)/);

    return match ? Number.parseInt(match[1], 10) : null;
}

export function getPdfTextSelection(fallbackPage: number): PdfTextSelection | null {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
        return null;
    }

    const text = selection.toString().trim();

    if (!text) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const textLayer = (
        range.commonAncestorContainer as Node
    ).parentElement?.closest('.textLayer');

    if (!textLayer) {
        return null;
    }

    const pageElement = textLayer.closest('[data-page]');
    const page = pageElement
        ? Number.parseInt(pageElement.getAttribute('data-page') ?? '', 10)
        : fallbackPage;

    if (!page || Number.isNaN(page)) {
        return null;
    }

    const cfi = buildPdfCfi(page, text);

    return {
        text,
        page,
        cfiStart: cfi,
        cfiEnd: cfi,
    };
}

export function applyHighlightToSelection(
    color: string = DEFAULT_HIGHLIGHT_COLOR,
): boolean {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
        return false;
    }

    const range = selection.getRangeAt(0);
    const mark = document.createElement('mark');

    mark.style.backgroundColor = color;
    mark.className = 'pdf-highlight';

    try {
        range.surroundContents(mark);
    } catch {
        const fragment = range.extractContents();
        mark.appendChild(fragment);
        range.insertNode(mark);
    }

    selection.removeAllRanges();

    return true;
}

function highlightTextInLayer(
    layer: HTMLElement,
    searchText: string,
    color: string,
): void {
    if (layer.querySelector(`[data-highlight-text="${CSS.escape(searchText)}"]`)) {
        return;
    }

    const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];

    let node = walker.nextNode();

    while (node) {
        nodes.push(node as Text);
        node = walker.nextNode();
    }

    const combined = nodes.map((textNode) => textNode.textContent ?? '').join('');
    const startIndex = combined.indexOf(searchText);

    if (startIndex === -1) {
        return;
    }

    const endIndex = startIndex + searchText.length;
    let currentIndex = 0;
    let rangeStartNode: Text | null = null;
    let rangeStartOffset = 0;
    let rangeEndNode: Text | null = null;
    let rangeEndOffset = 0;

    for (const textNode of nodes) {
        const length = textNode.textContent?.length ?? 0;
        const nodeStart = currentIndex;
        const nodeEnd = currentIndex + length;

        if (rangeStartNode === null && startIndex >= nodeStart && startIndex < nodeEnd) {
            rangeStartNode = textNode;
            rangeStartOffset = startIndex - nodeStart;
        }

        if (endIndex > nodeStart && endIndex <= nodeEnd) {
            rangeEndNode = textNode;
            rangeEndOffset = endIndex - nodeStart;
            break;
        }

        currentIndex = nodeEnd;
    }

    if (!rangeStartNode || !rangeEndNode) {
        return;
    }

    const range = document.createRange();
    range.setStart(rangeStartNode, rangeStartOffset);
    range.setEnd(rangeEndNode, rangeEndOffset);

    const mark = document.createElement('mark');
    mark.style.backgroundColor = color;
    mark.className = 'pdf-highlight';
    mark.setAttribute('data-highlight-text', searchText);

    try {
        range.surroundContents(mark);
    } catch {
        const fragment = range.extractContents();
        mark.appendChild(fragment);
        range.insertNode(mark);
    }
}

export function applyStoredHighlights(
    pageRoot: HTMLElement,
    highlights: Highlight[],
    page: number,
): void {
    const pageHighlights = highlights.filter(
        (highlight) => parsePageFromCfi(highlight.cfi_start) === page,
    );

    if (pageHighlights.length === 0) {
        return;
    }

    const textLayer = pageRoot.querySelector('.textLayer');

    if (!textLayer) {
        return;
    }

    for (const highlight of pageHighlights) {
        highlightTextInLayer(
            textLayer as HTMLElement,
            highlight.text,
            highlight.color,
        );
    }
}

export { DEFAULT_HIGHLIGHT_COLOR };
