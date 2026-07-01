import { useMemo } from 'react';

import { HighchartsChart } from '@/components/charts/highcharts-chart';

type PointChartData = {
    month: string;
    count: number;
};

type AdminColumnChartProps = {
    data: PointChartData[];
    title: string;
    color?: string;
    className?: string;
};

function AdminColumnChart({
    data,
    title,
    color = '#7d7517',
    className,
}: AdminColumnChartProps) {
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
                labels: { style: { color: '#6b6560' } },
            },
            yAxis: {
                title: { text: title },
                gridLineColor: '#f0ebe0',
                allowDecimals: false,
                labels: { style: { color: '#6b6560' } },
            },
            legend: { enabled: false },
            plotOptions: {
                column: { borderRadius: 4, color },
            },
            series: [
                {
                    type: 'column',
                    name: title,
                    data: data.map((d) => d.count),
                },
            ],
            tooltip: {
                backgroundColor: '#fefcf8',
                borderColor: '#e0d9cc',
            },
        }),
        [color, data, title],
    );

    if (data.length === 0) {
        return (
            <div
                className={`flex h-[280px] items-center justify-center text-sm text-muted-foreground ${className ?? ''}`}
            >
                No data yet
            </div>
        );
    }

    return (
        <div className={className}>
            <HighchartsChart options={options} />
        </div>
    );
}

export { AdminColumnChart };
