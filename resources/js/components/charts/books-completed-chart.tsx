import { useMemo } from 'react';

import { HighchartsChart } from '@/components/charts/highcharts-chart';
import type { BooksCompletedChartPoint } from '@/types/analytics';

type BooksCompletedChartProps = {
    data: BooksCompletedChartPoint[];
    className?: string;
};

function BooksCompletedChart({ data, className }: BooksCompletedChartProps) {
    const options = useMemo(
        () => ({
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: 280,
            },
            title: { text: undefined },
            credits: { enabled: false },
            xAxis: {
                categories: data.map((d) => d.month),
                lineColor: '#e0d9cc',
                tickColor: '#e0d9cc',
                labels: { style: { color: '#6b6560' } },
            },
            yAxis: {
                title: { text: 'Books completed' },
                gridLineColor: '#f0ebe0',
                labels: { style: { color: '#6b6560' } },
                allowDecimals: false,
            },
            legend: { enabled: false },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    color: '#7d7517',
                },
            },
            series: [
                {
                    type: 'column',
                    name: 'Completed',
                    data: data.map((d) => d.count),
                },
            ],
            tooltip: {
                backgroundColor: '#fefcf8',
                borderColor: '#e0d9cc',
                style: { color: '#2d2926' },
            },
        }),
        [data],
    );

    if (data.length === 0) {
        return (
            <div
                className={`flex h-[280px] items-center justify-center text-sm text-muted-foreground ${className ?? ''}`}
            >
                No completion data yet
            </div>
        );
    }

    return (
        <div className={className}>
            <HighchartsChart options={options} />
        </div>
    );
}

export { BooksCompletedChart };
