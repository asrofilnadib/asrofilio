import { router, usePage } from '@inertiajs/react';

export type Locale = 'en' | 'id';

const messages = {
    en: {
        nav_home: 'Home',
        nav_library: 'Library',
        nav_highlights: 'Highlights',
        nav_vocabulary: 'Vocabulary',
        nav_analytics: 'Analytics',
        nav_login: 'Login',
        nav_register: 'Register',
        nav_logout: 'Logout',
        nav_my_library: 'My Library',
        nav_admin: 'Admin Panel',
        library_my: 'My Library',
        library_public: 'Public Library',
        library_genre: 'Genre',
        library_total_books: 'Total books',
        library_no_genres: 'No genres available',
        library_search_public: 'Search public library…',
        library_search_mine: 'Search my library…',
        library_add_book: 'Add book',
        library_public_title: 'Experimental Public Library',
        library_public_desc:
            'Discover books shared by the community. Add titles to your personal library to read, highlight, and track progress. Please only upload content you have the right to use.',
        library_empty_mine: 'Your library is empty. Add your first book!',
        library_empty_public: 'No public books found.',
        library_empty_genres:
            'Select one or more genres to browse books.',
        library_sort: 'Sort by',
        sort_newest: 'Newest first',
        sort_oldest: 'Oldest first',
        sort_title_asc: 'Title A–Z',
        sort_title_desc: 'Title Z–A',
        sort_author_asc: 'Author A–Z',
        sort_author_desc: 'Author Z–A',
        theme_label: 'Theme',
        language_label: 'Language',
    },
    id: {
        nav_home: 'Beranda',
        nav_library: 'Perpustakaan',
        nav_highlights: 'Sorotan',
        nav_vocabulary: 'Kosakata',
        nav_analytics: 'Analitik',
        nav_login: 'Masuk',
        nav_register: 'Daftar',
        nav_logout: 'Keluar',
        nav_my_library: 'Perpustakaanku',
        nav_admin: 'Panel Admin',
        library_my: 'Perpustakaanku',
        library_public: 'Perpustakaan Publik',
        library_genre: 'Genre',
        library_total_books: 'Total buku',
        library_no_genres: 'Belum ada genre',
        library_search_public: 'Cari di perpustakaan publik…',
        library_search_mine: 'Cari di perpustakaanku…',
        library_add_book: 'Tambah buku',
        library_public_title: 'Perpustakaan Publik Eksperimental',
        library_public_desc:
            'Temukan buku yang dibagikan komunitas. Tambahkan ke perpustakaan pribadimu untuk membaca, menyorot, dan melacak progres. Unggah hanya konten yang berhak kamu gunakan.',
        library_empty_mine: 'Perpustakaanmu masih kosong. Tambahkan buku pertamamu!',
        library_empty_public: 'Tidak ada buku publik ditemukan.',
        library_empty_genres:
            'Pilih satu atau lebih genre untuk menampilkan buku.',
        library_sort: 'Urutkan',
        sort_newest: 'Terbaru',
        sort_oldest: 'Terlama',
        sort_title_asc: 'Judul A–Z',
        sort_title_desc: 'Judul Z–A',
        sort_author_asc: 'Penulis A–Z',
        sort_author_desc: 'Penulis Z–A',
        theme_label: 'Tema',
        language_label: 'Bahasa',
    },
} as const;

export type MessageKey = keyof (typeof messages)['en'];

export function useI18n() {
    const locale = (usePage().props.locale as Locale) ?? 'en';

    function t(key: MessageKey): string {
        return messages[locale][key] ?? messages.en[key];
    }

    return { locale, t };
}

export function setLocale(locale: Locale): void {
    router.post(
        '/preferences/locale',
        { locale },
        { preserveScroll: true, preserveState: true },
    );
}
