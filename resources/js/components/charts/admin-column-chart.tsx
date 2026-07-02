import { useMemo } from 'react';

import { HighchartsChart } from '@/components/charts/highcharts-chart';
import { useChartColors } from '@/lib/chart-theme';

type PointChartData = {
    month: string;
    count: number;
};

type AdminColumnChartProps = {
    data: PointChartData[];
    title: string;
    color?: string;
    tone?: 'primary' | 'secondary';
    className?: string;
};

function AdminColumnChart({
    data,
    title,
    color,
    tone = 'primary',
    className,
}: AdminColumnChartProps) {
    const chartColors = useChartColors();
    const barColor =
        color ??
        (tone === 'secondary' ? chartColors.chart2 : chartColors.chart1);

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
                lineColor: chartColors.border,
                labels: {
                    style: { color: chartColors.mutedForeground },
                },
            },
            yAxis: {
                title: { text: title },
                gridLineColor: chartColors.gridLine,
                allowDecimals: false,
                labels: {
                    style: { color: chartColors.mutedForeground },
                },
            },
            legend: { enabled: false },
            plotOptions: {
                column: { borderRadius: 4, color: barColor },
            },
            series: [
                {
                    type: 'column',
                    name: title,
                    data: data.map((d) => d.count),
                },
            ],
            tooltip: {
                backgroundColor: chartColors.tooltipBg,
                borderColor: chartColors.border,
            },
        }),
        [barColor, chartColors, data, title],
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
