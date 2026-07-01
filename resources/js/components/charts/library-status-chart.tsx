import { useMemo } from 'react';

import { HighchartsChart } from '@/components/charts/highcharts-chart';
import type { LibraryStatusBreakdown } from '@/types/analytics';

const statusLabels: Record<keyof LibraryStatusBreakdown, string> = {
    unread: 'Unread',
    in_progress: 'Reading',
    scheduled: 'Scheduled',
    completed: 'Completed',
};

const statusColors = ['#a39e4a', '#7d7517', '#c4b86a', '#5c5610'];

type LibraryStatusChartProps = {
    data: LibraryStatusBreakdown;
    className?: string;
};

function LibraryStatusChart({ data, className }: LibraryStatusChartProps) {
    const seriesData = useMemo(
        () =>
            (Object.entries(data) as Array<[keyof LibraryStatusBreakdown, number]>)
                .filter(([, count]) => count > 0)
                .map(([status, count], index) => ({
                    name: statusLabels[status],
                    y: count,
                    color: statusColors[index % statusColors.length],
                })),
        [data],
    );

    const options = useMemo(
        () => ({
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 260,
            },
            title: { text: undefined },
            credits: { enabled: false },
            tooltip: {
                backgroundColor: '#fefcf8',
                borderColor: '#e0d9cc',
                pointFormat: '<b>{point.y}</b> books',
            },
            plotOptions: {
                pie: {
                    innerSize: '55%',
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        style: { color: '#6b6560', fontWeight: '500' },
                    },
                },
            },
            series: [
                {
                    type: 'pie',
                    name: 'Books',
                    data: seriesData,
                },
            ],
        }),
        [seriesData],
    );

    if (seriesData.length === 0) {
        return (
            <div
                className={`flex h-[260px] items-center justify-center text-sm text-muted-foreground ${className ?? ''}`}
            >
                No library data yet
            </div>
        );
    }

    return (
        <div className={className}>
            <HighchartsChart options={options} />
        </div>
    );
}

export { LibraryStatusChart };
