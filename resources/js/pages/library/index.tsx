import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { LibraryBrowse } from '@/components/asrofilio/library-browse';
import type { LibraryFilters } from '@/components/asrofilio/library-sidebar';
import AppLayout from '@/layouts/app-layout';
import type {
    Book,
    Genre,
    Paginated,
    ReadingStatus,
    UserBook,
} from '@/types/book';

type LibraryIndexProps = {
    books: Paginated<Book & { user_book?: UserBook | null; userBooks?: UserBook[] }>;
    genres: Genre[];
    counts: { mine: number; public: number };
    filters: LibraryFilters & {
        scope: 'mine' | 'public';
        status?: ReadingStatus | null;
    };
};

function LibraryIndex(props: LibraryIndexProps) {
    return (
        <>
            <Head title="Library" />
            <LibraryBrowse {...props} />
        </>
    );
}

LibraryIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default LibraryIndex;
