import { useEffect, useState } from 'react';

export type ChartColors = {
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    border: string;
    mutedForeground: string;
    gridLine: string;
    tooltipBg: string;
};

const fallbackColors: ChartColors = {
    chart1: '#7d7517',
    chart2: '#a39e4a',
    chart3: '#5c5610',
    chart4: '#c4b86a',
    chart5: '#2d2926',
    border: '#e0d9cc',
    mutedForeground: '#6b6560',
    gridLine: '#f0ebe0',
    tooltipBg: '#fefcf8',
};

function readCssVar(name: string, fallback: string): string {
    if (typeof document === 'undefined') {
        return fallback;
    }

    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

    return value || fallback;
}

export function getChartColors(): ChartColors {
    return {
        chart1: readCssVar('--chart-1', fallbackColors.chart1),
        chart2: readCssVar('--chart-2', fallbackColors.chart2),
        chart3: readCssVar('--chart-3', fallbackColors.chart3),
        chart4: readCssVar('--chart-4', fallbackColors.chart4),
        chart5: readCssVar('--chart-5', fallbackColors.chart5),
        border: readCssVar('--border', fallbackColors.border),
        mutedForeground: readCssVar(
            '--muted-foreground',
            fallbackColors.mutedForeground,
        ),
        gridLine: readCssVar('--muted', fallbackColors.gridLine),
        tooltipBg: readCssVar('--card', fallbackColors.tooltipBg),
    };
}

export function useChartColors(): ChartColors {
    const [colors, setColors] = useState<ChartColors>(getChartColors);

    useEffect(() => {
        const update = () => setColors(getChartColors());

        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => observer.disconnect();
    }, []);

    return colors;
}

export function chartPalette(colors: ChartColors): string[] {
    return [
        colors.chart1,
        colors.chart2,
        colors.chart3,
        colors.chart4,
    ];
}
