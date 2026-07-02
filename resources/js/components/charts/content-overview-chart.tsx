import { useMemo } from 'react';

import { HighchartsChart } from '@/components/charts/highcharts-chart';
import { chartPalette, useChartColors } from '@/lib/chart-theme';

type OverviewPoint = {
    name: string;
    y: number;
};

type ContentOverviewChartProps = {
    data: OverviewPoint[];
    className?: string;
};

function ContentOverviewChart({ data, className }: ContentOverviewChartProps) {
    const chartColors = useChartColors();
    const palette = chartPalette(chartColors);

    const seriesData = useMemo(
        () =>
            data
                .filter((item) => item.y > 0)
                .map((item, index) => ({
                    ...item,
                    color: palette[index % palette.length],
                })),
        [data, palette],
    );

    const options = useMemo(
        () => ({
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 280,
            },
            title: { text: undefined },
            credits: { enabled: false },
            tooltip: {
                backgroundColor: chartColors.tooltipBg,
                borderColor: chartColors.border,
                pointFormat: '<b>{point.y}</b>',
            },
            plotOptions: {
                pie: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.y}',
                        style: { color: chartColors.mutedForeground },
                    },
                },
            },
            series: [
                {
                    type: 'pie',
                    name: 'Total',
                    data: seriesData,
                },
            ],
        }),
        [chartColors, seriesData],
    );

    if (seriesData.length === 0) {
        return (
            <div
                className={`flex h-[280px] items-center justify-center text-sm text-muted-foreground ${className ?? ''}`}
            >
                No content yet
            </div>
        );
    }

    return (
        <div className={className}>
            <HighchartsChart options={options} />
        </div>
    );
}

export { ContentOverviewChart };
