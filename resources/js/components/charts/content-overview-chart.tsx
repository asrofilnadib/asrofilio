import { useMemo } from 'react';

import { HighchartsChart } from '@/components/charts/highcharts-chart';

type OverviewPoint = {
    name: string;
    y: number;
};

type ContentOverviewChartProps = {
    data: OverviewPoint[];
    className?: string;
};

const palette = ['#7d7517', '#a39e4a', '#5c5610', '#c4b86a'];

function ContentOverviewChart({ data, className }: ContentOverviewChartProps) {
    const seriesData = useMemo(
        () =>
            data
                .filter((item) => item.y > 0)
                .map((item, index) => ({
                    ...item,
                    color: palette[index % palette.length],
                })),
        [data],
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
                backgroundColor: '#fefcf8',
                borderColor: '#e0d9cc',
                pointFormat: '<b>{point.y}</b>',
            },
            plotOptions: {
                pie: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.y}',
                        style: { color: '#6b6560' },
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
        [seriesData],
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
