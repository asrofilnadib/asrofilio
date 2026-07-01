export type ReadingStats = {
    period: {
        from: string;
        to: string;
    };
    total_reading_seconds: number;
    total_pages_read: number;
    session_count: number;
    books_completed: number;
    books_in_progress: number;
    average_session_minutes: number;
};

export type DailyReadingActivity = {
    date: string;
    total_seconds: number;
    total_pages: number;
    session_count: number;
};

export type LibraryStatusBreakdown = {
    unread: number;
    in_progress: number;
    scheduled: number;
    completed: number;
};

export type BooksCompletedChartPoint = {
    month: string;
    count: number;
};

export type WordCloudItem = {
    text: string;
    value: number;
};

export type AnalyticsPageProps = {
    stats: ReadingStats;
    dailyActivity: DailyReadingActivity[];
    statusBreakdown: LibraryStatusBreakdown;
    booksCompletedChart: BooksCompletedChartPoint[];
    vocabularyWordCloud: WordCloudItem[];
};
