import { useEffect, useRef } from 'react';

import type { WordCloudItem } from '@/types/analytics';

type VocabularyWordcloudProps = {
    words: WordCloudItem[];
    className?: string;
    width?: number;
    height?: number;
};

const palette = [
    '#7d7517',
    '#5c5610',
    '#a39e4a',
    '#2d2926',
    '#c4b86a',
    '#6b6560',
];

function VocabularyWordcloud({
    words,
    className,
    width = 600,
    height = 300,
}: VocabularyWordcloudProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || words.length === 0) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const maxValue = Math.max(...words.map((w) => w.value));
        const minValue = Math.min(...words.map((w) => w.value));
        const placed: Array<{
            x: number;
            y: number;
            w: number;
            h: number;
        }> = [];

        function collides(
            x: number,
            y: number,
            w: number,
            h: number,
        ): boolean {
            return placed.some(
                (p) =>
                    x < p.x + p.w &&
                    x + w > p.x &&
                    y < p.y + p.h &&
                    y + h > p.y,
            );
        }

        const centerX = width / 2;
        const centerY = height / 2;
        let angle = 0;
        let radius = 0;

        words.forEach((word, index) => {
            const normalized =
                maxValue === minValue
                    ? 0.5
                    : (word.value - minValue) / (maxValue - minValue);
            const fontSize = 14 + normalized * 28;
            ctx.font = `600 ${fontSize}px "Libre Baskerville", Georgia, serif`;
            const metrics = ctx.measureText(word.text);
            const w = metrics.width + 8;
            const h = fontSize + 8;

            let placedWord = false;
            let attempts = 0;

            while (!placedWord && attempts < 200) {
                const x = centerX + Math.cos(angle) * radius - w / 2;
                const y = centerY + Math.sin(angle) * radius - h / 2;

                if (
                    x >= 4 &&
                    y >= 4 &&
                    x + w <= width - 4 &&
                    y + h <= height - 4 &&
                    !collides(x, y, w, h)
                ) {
                    ctx.fillStyle = palette[index % palette.length] ?? palette[0];
                    ctx.fillText(word.text, x + 4, y + fontSize);
                    placed.push({ x, y, w, h });
                    placedWord = true;
                }

                angle += 0.35;
                radius += 0.8;
                attempts++;
            }
        });
    }, [words, width, height]);

    if (words.length === 0) {
        return (
            <div
                className={`flex h-[300px] items-center justify-center text-sm text-muted-foreground ${className ?? ''}`}
            >
                No vocabulary words yet
            </div>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className={className}
            aria-label="Vocabulary word cloud"
        />
    );
}

export { VocabularyWordcloud };
