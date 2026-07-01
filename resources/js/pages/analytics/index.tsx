import { Deferred, Head } from '@inertiajs/react';
import { BookCheck, BookMarked, Clock, Flame } from 'lucide-react';
import type { ReactNode } from 'react';

import { BooksCompletedChart } from '@/components/charts/books-completed-chart';
import { VocabularyWordcloud } from '@/components/charts/vocabulary-wordcloud';
import { LoadingAsrofilio } from '@/components/asrofilio/loading-asrofilio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { AnalyticsPageProps } from '@/types/analytics';

type AnalyticsIndexProps = AnalyticsPageProps;

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function AnalyticsIndex({
    stats,
    dailyActivity,
    statusBreakdown,
    booksCompletedChart,
    vocabularyWordCloud,
}: AnalyticsIndexProps) {
    const statCards = [
        {
            label: 'Reading time',
            value: formatDuration(stats.total_reading_seconds),
            icon: Clock,
        },
        {
            label: 'Pages read',
            value: stats.total_pages_read.toLocaleString(),
            icon: BookMarked,
        },
        {
            label: 'Books completed',
            value: stats.books_completed,
            icon: BookCheck,
        },
        {
            label: 'Avg session',
            value: `${stats.average_session_minutes} min`,
            icon: Flame,
        },
    ];

    return (
        <>
            <Head title="Analytics" />

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-bold">
                        Reading Analytics
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Insights into your reading habits
                    </p>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map(({ label, value, icon: Icon }) => (
                        <Card key={label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {label}
                                </CardTitle>
                                <Icon className="size-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mb-8 grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-serif">
                                Books completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Deferred
                                data="booksCompletedChart"
                                fallback={
                                    <LoadingAsrofilio
                                        variant="inline"
                                        message="Loading chart…"
                                    />
                                }
                            >
                                <BooksCompletedChart
                                    data={booksCompletedChart}
                                />
                            </Deferred>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-serif">
                                Library status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {(
                                    Object.entries(statusBreakdown) as Array<
                                        [string, number]
                                    >
                                ).map(([status, count]) => (
                                    <div
                                        key={status}
                                        className="rounded-lg bg-secondary/50 p-4 text-center"
                                    >
                                        <p className="text-2xl font-bold">
                                            {count}
                                        </p>
                                        <p className="text-xs capitalize text-muted-foreground">
                                            {status.replace('_', ' ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="font-serif">
                            Vocabulary cloud
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Deferred
                            data="vocabularyWordCloud"
                            fallback={
                                <LoadingAsrofilio
                                    variant="inline"
                                    message="Building word cloud…"
                                />
                            }
                        >
                            <VocabularyWordcloud
                                words={vocabularyWordCloud}
                                className="max-w-full"
                            />
                        </Deferred>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif">
                            Daily activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dailyActivity.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No reading sessions recorded yet
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {dailyActivity.map((day) => (
                                    <div
                                        key={day.date}
                                        className="flex items-center justify-between rounded-md border border-border px-4 py-2 text-sm"
                                    >
                                        <span>
                                            {new Date(
                                                day.date,
                                            ).toLocaleDateString()}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {formatDuration(day.total_seconds)}{' '}
                                            · {day.total_pages} pages ·{' '}
                                            {day.session_count} session
                                            {day.session_count !== 1
                                                ? 's'
                                                : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AnalyticsIndex.layout = (page: ReactNode) => (
    <AppLayout>{page}</AppLayout>
);

export default AnalyticsIndex;
