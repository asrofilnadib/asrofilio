import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';

import type { DailyReadingActivity } from '@/types/analytics';

type ReadingActivityChartProps = {
    data: DailyReadingActivity[];
    className?: string;
};

function ReadingActivityChart({ data, className }: ReadingActivityChartProps) {
    const options = useMemo<Highcharts.Options>(
        () => ({
            chart: {
                type: 'areaspline',
                backgroundColor: 'transparent',
                height: 260,
            },
            title: { text: undefined },
            credits: { enabled: false },
            xAxis: {
                categories: data.map((d) =>
                    new Date(d.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                    }),
                ),
                lineColor: '#e0d9cc',
                tickColor: '#e0d9cc',
                labels: { style: { color: '#6b6560' } },
            },
            yAxis: {
                title: { text: 'Minutes' },
                gridLineColor: '#f0ebe0',
                labels: { style: { color: '#6b6560' } },
                min: 0,
            },
            legend: { enabled: false },
            plotOptions: {
                areaspline: {
                    fillOpacity: 0.25,
                    lineWidth: 2,
                    color: '#7d7517',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(125, 117, 23, 0.35)'],
                            [1, 'rgba(125, 117, 23, 0.02)'],
                        ],
                    },
                    marker: { radius: 3, fillColor: '#7d7517' },
                },
            },
            series: [
                {
                    type: 'areaspline',
                    name: 'Reading time',
                    data: data.map((d) =>
                        Math.round(d.total_seconds / 60),
                    ),
                },
            ],
            tooltip: {
                backgroundColor: '#fefcf8',
                borderColor: '#e0d9cc',
                pointFormat: '<b>{point.y}</b> min',
            },
        }),
        [data],
    );

    if (data.length === 0) {
        return (
            <div
                className={`flex h-[260px] items-center justify-center text-sm text-muted-foreground ${className ?? ''}`}
            >
                No reading sessions yet
            </div>
        );
    }

    return (
        <div className={className}>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
}

export { ReadingActivityChart };
