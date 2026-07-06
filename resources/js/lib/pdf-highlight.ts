import type { Highlight } from '@/types/book';

import { DEFAULT_HIGHLIGHT_COLOR } from '@/lib/highlight-colors';

export const DEFAULT_NOTE_QUOTE_COLOR = '#cce5ff';

export type PdfSelectionRect = {
    top: number;
    left: number;
    width: number;
    height: number;
};

export type PdfTextSelection = {
    text: string;
    page: number;
    cfiStart: string;
    cfiEnd: string;
    rect: PdfSelectionRect;
    anchorPercent: number;
};

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

function resolvePageContainer(textLayer: Element): HTMLElement | null {
    return textLayer.closest('[data-page]') as HTMLElement | null;
}

function resolveTextLayerFromRange(range: Range): Element | null {
    const container = range.commonAncestorContainer;

    if (container.nodeType === Node.TEXT_NODE) {
        return container.parentElement?.closest('.textLayer') ?? null;
    }

    if (container instanceof Element) {
        if (container.classList.contains('textLayer')) {
            return container;
        }

        return container.closest('.textLayer');
    }

    return null;
}

function buildSelectionMetrics(
    range: Range,
    pageElement: HTMLElement,
): { rect: PdfSelectionRect; anchorPercent: number } {
    const selectionRect = range.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();
    const top = selectionRect.top - pageRect.top;
    const left = selectionRect.left - pageRect.left;
    const height = pageRect.height > 0 ? pageRect.height : 1;
    const anchorPercent = Math.max(
        0,
        Math.min(100, Math.round((top / height) * 100)),
    );

    return {
        rect: {
            top,
            left,
            width: selectionRect.width,
            height: selectionRect.height,
        },
        anchorPercent,
    };
}

export function getPdfTextSelection(
    fallbackPage: number,
): PdfTextSelection | null {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
        return null;
    }

    const text = selection.toString().trim();

    if (!text) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const textLayer = resolveTextLayerFromRange(range);

    if (!textLayer) {
        return null;
    }

    const pageElement = resolvePageContainer(textLayer);

    if (!pageElement) {
        return null;
    }

    const page = pageElement
        ? Number.parseInt(pageElement.getAttribute('data-page') ?? '', 10)
        : fallbackPage;

    if (!page || Number.isNaN(page)) {
        return null;
    }

    const cfi = buildPdfCfi(page, text);
    const { rect, anchorPercent } = buildSelectionMetrics(range, pageElement);

    return {
        text,
        page,
        cfiStart: cfi,
        cfiEnd: cfi,
        rect,
        anchorPercent,
    };
}

export function applyHighlightToSelection(
    color: string = DEFAULT_HIGHLIGHT_COLOR,
): HTMLElement | null {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
        return null;
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

    return mark;
}

export function applyQuotedTextMark(
    pageRoot: HTMLElement,
    quotedText: string,
    color: string = DEFAULT_NOTE_QUOTE_COLOR,
): void {
    const textLayer = pageRoot.querySelector('.textLayer');

    if (!textLayer || !quotedText.trim()) {
        return;
    }

    markTextInLayer(
        textLayer as HTMLElement,
        quotedText,
        color,
        'pdf-note-quote',
        'note-quote-text',
    );
}

export function applyStoredNoteMarks(
    pageRoot: HTMLElement,
    notes: Array<{ quoted_text?: string | null; cfi_location?: string | null }>,
    page: number,
): void {
    const pageNotes = notes.filter(
        (note) => parsePageFromCfi(note.cfi_location ?? '') === page,
    );

    for (const note of pageNotes) {
        if (!note.quoted_text) {
            continue;
        }

        applyQuotedTextMark(pageRoot, note.quoted_text);
    }
}

function markTextInLayer(
    layer: HTMLElement,
    searchText: string,
    color: string,
    className: string,
    dataAttribute?: string,
): void {
    const selector = dataAttribute
        ? `[data-${dataAttribute}="${CSS.escape(searchText)}"]`
        : null;

    if (selector && layer.querySelector(selector)) {
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
    mark.className = className;

    if (dataAttribute) {
        mark.setAttribute(`data-${dataAttribute}`, searchText);
    }

    try {
        range.surroundContents(mark);
    } catch {
        const fragment = range.extractContents();
        mark.appendChild(fragment);
        range.insertNode(mark);
    }
}

function highlightTextInLayer(
    layer: HTMLElement,
    searchText: string,
    color: string,
): void {
    markTextInLayer(layer, searchText, color, 'pdf-highlight', 'highlight-text');
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
