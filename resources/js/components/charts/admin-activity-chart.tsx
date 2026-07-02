import { useMemo } from 'react';

import { HighchartsChart } from '@/components/charts/highcharts-chart';
import { useChartColors } from '@/lib/chart-theme';

type ActivityPoint = {
    date: string;
    count: number;
};

type AdminActivityChartProps = {
    data: ActivityPoint[];
    className?: string;
};

function AdminActivityChart({ data, className }: AdminActivityChartProps) {
    const chartColors = useChartColors();

    const options = useMemo(
        () => ({
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: 280,
            },
            title: { text: undefined },
            credits: { enabled: false },
            xAxis: {
                categories: data.map((d) => d.date),
                lineColor: chartColors.border,
                labels: {
                    style: { color: chartColors.mutedForeground },
                },
            },
            yAxis: {
                title: { text: 'Actions' },
                gridLineColor: chartColors.gridLine,
                allowDecimals: false,
                labels: {
                    style: { color: chartColors.mutedForeground },
                },
                min: 0,
            },
            legend: { enabled: false },
            plotOptions: {
                line: {
                    color: chartColors.chart1,
                    lineWidth: 2,
                    marker: { radius: 4 },
                },
            },
            series: [
                {
                    type: 'line',
                    name: 'Activity',
                    data: data.map((d) => d.count),
                },
            ],
            tooltip: {
                backgroundColor: chartColors.tooltipBg,
                borderColor: chartColors.border,
            },
        }),
        [chartColors, data],
    );

    if (data.length === 0) {
        return (
            <div
                className={`flex h-[280px] items-center justify-center text-sm text-muted-foreground ${className ?? ''}`}
            >
                No activity in the last 7 days
            </div>
        );
    }

    return (
        <div className={className}>
            <HighchartsChart options={options} />
        </div>
    );
}

export { AdminActivityChart };
