import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookMarked,
    BookOpen,
    Bookmark,
    Highlighter,
    Quote,
    StickyNote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { ReadingProgressBar } from '@/components/asrofilio/reading-progress-bar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin-layout';
import { paths } from '@/lib/paths';
import type {
    AdminUserActivity,
    AdminUserBookEntry,
    AdminUserBookmark,
    AdminUserHighlight,
    AdminUserNote,
    AdminUserStats,
    AdminUserVocabulary,
} from '@/types/admin';
import type { User } from '@/types/auth';

type AdminUserShowProps = {
    user: User;
    stats: AdminUserStats;
    currently_reading: AdminUserBookEntry[];
    library: AdminUserBookEntry[];
    highlights: AdminUserHighlight[];
    notes: AdminUserNote[];
    vocabulary: AdminUserVocabulary[];
    bookmarks: AdminUserBookmark[];
    activity: AdminUserActivity[];
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatAction(action: string): string {
    return action
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
}

function StatTile({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: LucideIcon;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                </div>
                <div>
                    <p className="text-2xl font-bold tabular-nums">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function ReadingCard({ entry }: { entry: AdminUserBookEntry }) {
    if (!entry.book) {
        return null;
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-medium line-clamp-2">
                            {entry.book.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {entry.book.author}
                        </p>
                    </div>
                    <Badge variant="secondary">
                        {entry.progress_percent}%
                    </Badge>
                </div>
                <ReadingProgressBar
                    value={entry.progress_percent}
                    showLabel={false}
                    size="md"
                    className="mt-3"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                    Page {entry.current_page}
                    {entry.book.page_count
                        ? ` of ${entry.book.page_count}`
                        : ''}
                    {' · '}
                    Updated {formatDate(entry.updated_at)}
                </p>
            </CardContent>
        </Card>
    );
}

function BookCell({
    book,
}: {
    book: { title: string; author: string } | null;
}) {
    if (!book) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <div>
            <p className="font-medium line-clamp-1">{book.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">
                {book.author}
            </p>
        </div>
    );
}

function AdminUserShow({
    user,
    stats,
    currently_reading,
    library,
    highlights,
    notes,
    vocabulary,
    bookmarks,
    activity,
}: AdminUserShowProps) {
    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const statTiles = [
        { label: 'Library books', value: stats.library_count, icon: BookOpen },
        { label: 'Reading now', value: stats.reading_count, icon: BookMarked },
        { label: 'Completed', value: stats.completed_count, icon: BookOpen },
        { label: 'Highlights', value: stats.highlights_count, icon: Highlighter },
        { label: 'Notes', value: stats.notes_count, icon: StickyNote },
        { label: 'Vocabulary', value: stats.vocabulary_count, icon: BookMarked },
        { label: 'Bookmarks', value: stats.bookmarks_count, icon: Bookmark },
        { label: 'Quotes', value: stats.quotes_count, icon: Quote },
    ];

    return (
        <>
            <Head title={`Admin — ${user.name}`} />

            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <Link
                        href={paths.admin.users}
                        className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                        <h1 className="font-serif text-3xl font-bold">
                            {user.name}
                        </h1>
                        <p className="text-muted-foreground">
                            User activity & reading profile
                        </p>
                    </div>
                </div>

                <Card>
                    <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="size-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex size-16 items-center justify-center rounded-full bg-primary/15 font-serif text-xl font-semibold text-primary">
                                {initials}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-serif text-xl font-semibold">
                                    {user.name}
                                </h2>
                                <Badge
                                    variant={
                                        user.role === 'admin'
                                            ? 'default'
                                            : 'outline'
                                    }
                                >
                                    {user.role}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Joined {formatDate(user.created_at)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {statTiles.map((tile) => (
                        <StatTile key={tile.label} {...tile} />
                    ))}
                </div>

                {currently_reading.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="font-serif text-xl font-semibold">
                            Currently reading
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {currently_reading.map((entry) => (
                                <ReadingCard key={entry.id} entry={entry} />
                            ))}
                        </div>
                    </section>
                )}

                <Tabs defaultValue="library" className="space-y-4">
                    <TabsList className="h-auto flex-wrap">
                        <TabsTrigger value="library">
                            Library ({library.length})
                        </TabsTrigger>
                        <TabsTrigger value="highlights">
                            Highlights ({highlights.length})
                        </TabsTrigger>
                        <TabsTrigger value="notes">
                            Notes ({notes.length})
                        </TabsTrigger>
                        <TabsTrigger value="vocabulary">
                            Vocabulary ({vocabulary.length})
                        </TabsTrigger>
                        <TabsTrigger value="bookmarks">
                            Bookmarks ({bookmarks.length})
                        </TabsTrigger>
                        <TabsTrigger value="activity">
                            Activity ({activity.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="library">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif text-lg">
                                    Personal library
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Book</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Progress</TableHead>
                                            <TableHead>Updated</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {library.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="py-10 text-center text-muted-foreground"
                                                >
                                                    No books in library
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            library.map((entry) => (
                                                <TableRow key={entry.id}>
                                                    <TableCell>
                                                        <BookCell
                                                            book={entry.book}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="capitalize"
                                                        >
                                                            {statusLabel(
                                                                entry.status,
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="tabular-nums">
                                                        {entry.progress_percent}%
                                                        <span className="block text-xs text-muted-foreground">
                                                            p. {entry.current_page}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDate(
                                                            entry.updated_at,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="highlights">
                        <Card>
                            <CardContent className="divide-y divide-border p-0">
                                {highlights.length === 0 ? (
                                    <p className="py-10 text-center text-muted-foreground">
                                        No highlights yet
                                    </p>
                                ) : (
                                    highlights.map((item) => (
                                        <div
                                            key={item.id}
                                            className="space-y-2 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <BookCell book={item.book} />
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatDate(item.created_at)}
                                                </span>
                                            </div>
                                            <p
                                                className="rounded-md border-l-4 py-1 pl-3 text-sm leading-relaxed"
                                                style={{
                                                    borderColor: item.color,
                                                    backgroundColor: `${item.color}33`,
                                                }}
                                            >
                                                &ldquo;{item.text}&rdquo;
                                            </p>
                                            {item.chapter_title && (
                                                <p className="text-xs text-muted-foreground">
                                                    {item.chapter_title}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notes">
                        <Card>
                            <CardContent className="divide-y divide-border p-0">
                                {notes.length === 0 ? (
                                    <p className="py-10 text-center text-muted-foreground">
                                        No notes yet
                                    </p>
                                ) : (
                                    notes.map((item) => (
                                        <div
                                            key={item.id}
                                            className="space-y-2 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <BookCell book={item.book} />
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatDate(item.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {item.content}
                                            </p>
                                            {item.chapter_title && (
                                                <p className="text-xs text-muted-foreground">
                                                    {item.chapter_title}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vocabulary">
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Word</TableHead>
                                            <TableHead>Definition</TableHead>
                                            <TableHead>Book</TableHead>
                                            <TableHead>Added</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vocabulary.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="py-10 text-center text-muted-foreground"
                                                >
                                                    No vocabulary saved
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            vocabulary.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.word}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs text-sm text-muted-foreground line-clamp-2">
                                                        {item.definition ?? '—'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <BookCell
                                                            book={item.book}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDate(
                                                            item.created_at,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bookmarks">
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Label</TableHead>
                                            <TableHead>Book</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Saved</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookmarks.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="py-10 text-center text-muted-foreground"
                                                >
                                                    No bookmarks yet
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            bookmarks.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.label ??
                                                            item.chapter_title ??
                                                            'Bookmark'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <BookCell
                                                            book={item.book}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {item.cfi_location}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDate(
                                                            item.created_at,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity">
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>When</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activity.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="py-10 text-center text-muted-foreground"
                                                >
                                                    No activity logged
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            activity.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {formatAction(
                                                                item.action,
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {item.subject_type ??
                                                            '—'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDateTime(
                                                            item.created_at,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

AdminUserShow.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AdminUserShow;
