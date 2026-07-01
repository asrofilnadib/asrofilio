import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';

type ActivityPoint = {
    date: string;
    count: number;
};

type AdminActivityChartProps = {
    data: ActivityPoint[];
    className?: string;
};

function AdminActivityChart({ data, className }: AdminActivityChartProps) {
    const options = useMemo<Highcharts.Options>(
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
                lineColor: '#e0d9cc',
                labels: { style: { color: '#6b6560' } },
            },
            yAxis: {
                title: { text: 'Actions' },
                gridLineColor: '#f0ebe0',
                allowDecimals: false,
                labels: { style: { color: '#6b6560' } },
                min: 0,
            },
            legend: { enabled: false },
            plotOptions: {
                line: {
                    color: '#7d7517',
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
                backgroundColor: '#fefcf8',
                borderColor: '#e0d9cc',
            },
        }),
        [data],
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
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
}

export { AdminActivityChart };
