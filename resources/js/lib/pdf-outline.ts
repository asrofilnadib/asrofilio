import { pdfjs } from 'react-pdf';

import type { BookChapter } from '@/types/book';

type PdfOutlineItem = {
    title: string;
    dest?: string | unknown[] | null;
    items?: PdfOutlineItem[];
};

async function resolvePageNumber(
    pdf: pdfjs.PDFDocumentProxy,
    dest: string | unknown[] | null | undefined,
): Promise<number> {
    if (!dest) {
        return 1;
    }

    try {
        const destination =
            typeof dest === 'string' ? await pdf.getDestination(dest) : dest;

        if (!Array.isArray(destination) || destination.length === 0) {
            return 1;
        }

        const pageIndex = await pdf.getPageIndex(
            destination[0] as { num: number; gen: number },
        );

        return pageIndex + 1;
    } catch {
        return 1;
    }
}

async function mapOutlineItems(
    pdf: pdfjs.PDFDocumentProxy,
    items: PdfOutlineItem[],
    level: number,
    orderStart: { value: number },
): Promise<BookChapter[]> {
    const chapters: BookChapter[] = [];

    for (const item of items) {
        const page = await resolvePageNumber(pdf, item.dest ?? null);
        const id = orderStart.value++;

        chapters.push({
            id,
            book_id: 0,
            title: item.title,
            href: `page:${page}`,
            order: id,
            level,
            children: item.items?.length
                ? await mapOutlineItems(
                      pdf,
                      item.items,
                      level + 1,
                      orderStart,
                  )
                : undefined,
        });
    }

    return chapters;
}

async function loadPdfOutline(url: string): Promise<BookChapter[]> {
    const pdf = await pdfjs.getDocument({ url, withCredentials: true }).promise;
    const outline = (await pdf.getOutline()) as PdfOutlineItem[] | null;

    if (!outline?.length) {
        return [];
    }

    return mapOutlineItems(pdf, outline, 1, { value: 1 });
}

function parsePageFromHref(href?: string | null): number | null {
    if (!href) {
        return null;
    }

    const match = href.match(/^page:(\d+)$/);

    return match ? Number.parseInt(match[1], 10) : null;
}

function findChapterTitle(
    chapters: BookChapter[],
    page: number,
): string | null {
    let best: BookChapter | null = null;
    let bestPage = 0;

    function walk(items: BookChapter[]): void {
        for (const chapter of items) {
            const chapterPage = parsePageFromHref(chapter.href);

            if (
                chapterPage !== null &&
                chapterPage <= page &&
                chapterPage >= bestPage
            ) {
                bestPage = chapterPage;
                best = chapter;
            }

            if (chapter.children?.length) {
                walk(chapter.children);
            }
        }
    }

    walk(chapters);

    return best?.title ?? null;
}

export { findChapterTitle, loadPdfOutline, parsePageFromHref };
