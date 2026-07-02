<?php

/**
 * Curated catalog of 65 popular bestsellers for the public library.
 *
 * @return list<array{
 *     title: string,
 *     author: string,
 *     isbn: string,
 *     description: string,
 *     page_count: int,
 *     language: 'en'|'id',
 *     genres: list<string>,
 *     open_library_key?: string|null,
 *     metadata?: array<string, mixed>
 * }>
 */
return (static function (): array {
    $books = [
        // Indonesian bestsellers
        ['title' => 'Laskar Pelangi', 'author' => 'Andrea Hirata', 'isbn' => '9789791227835', 'description' => 'Kisah inspiratif anak-anak Belitung yang berjuang meraih pendidikan di tengah keterbatasan.', 'page_count' => 534, 'language' => 'id', 'genres' => ['fiction']],
        ['title' => 'Sang Pemimpi', 'author' => 'Andrea Hirata', 'isbn' => '9789791227859', 'description' => 'Kelanjutan perjalanan Ikal dan Arai mengejar mimpi studi ke Paris.', 'page_count' => 292, 'language' => 'id', 'genres' => ['fiction']],
        ['title' => 'Edensor', 'author' => 'Andrea Hirata', 'isbn' => '9789791227873', 'description' => 'Petualangan Ikal di Eropa sambil mengenang akar rumahnya di Belitung.', 'page_count' => 308, 'language' => 'id', 'genres' => ['fiction']],
        ['title' => 'Bumi Manusia', 'author' => 'Pramoedya Ananta Toer', 'isbn' => '9789799106890', 'description' => 'Roman sejarah kolonial yang mengisahkan Minke dan perjuangan bangsa di awal abad ke-20.', 'page_count' => 535, 'language' => 'id', 'genres' => ['fiction', 'history']],
        ['title' => 'Anak Semua Bangsa', 'author' => 'Pramoedya Ananta Toer', 'isbn' => '9789799106906', 'description' => 'Lanjutan kisah Minke yang semakin aktif dalam gerakan kebangkitan nasional.', 'page_count' => 430, 'language' => 'id', 'genres' => ['fiction', 'history']],
        ['title' => 'Filosofi Teras', 'author' => 'Henry Manampiring', 'isbn' => '9786020645913', 'description' => 'Panduan praktis stoisisme untuk hidup tenang di era modern.', 'page_count' => 344, 'language' => 'id', 'genres' => ['philosophy', 'non-fiction']],
        ['title' => '5 cm', 'author' => 'Donny Dhirgantoro', 'isbn' => '9789791222021', 'description' => 'Perjalanan persahabatan lima sahabat menjelajahi keindahan Indonesia.', 'page_count' => 424, 'language' => 'id', 'genres' => ['fiction', 'romance']],
        ['title' => 'Negeri 5 Menara', 'author' => 'Ahmad Fuadi', 'isbn' => '9789790818614', 'description' => 'Kisah Alif dan kawan-kawan di pesantren yang bermimpi melanglang buana.', 'page_count' => 424, 'language' => 'id', 'genres' => ['fiction', 'biography']],
        ['title' => 'Habibie & Ainun', 'author' => 'Bachrudin M. Bachrie', 'isbn' => '9789792266783', 'description' => 'Kisah cinta dan perjuangan B.J. Habibie bersama Ainun.', 'page_count' => 412, 'language' => 'id', 'genres' => ['biography', 'romance']],
        ['title' => 'Supernova: Ksatria, Puteri, dan Bintang Jatuh', 'author' => 'Dewi Lestari', 'isbn' => '9789792283780', 'description' => 'Roman fantasi ilmiah tentang cinta, musik, dan misteri semesta.', 'page_count' => 312, 'language' => 'id', 'genres' => ['fiction', 'fantasy', 'romance']],
        ['title' => 'Perahu Kertas', 'author' => 'Dee', 'isbn' => '9789792283704', 'description' => 'Kisah cinta Kugy dan Keenan yang diuji jarak dan waktu.', 'page_count' => 368, 'language' => 'id', 'genres' => ['fiction', 'romance']],
        ['title' => 'Hujan', 'author' => 'Tere Liye', 'isbn' => '9786022911369', 'description' => 'Drama keluarga dan pengorbanan yang berakar pada sebuah rahasia.', 'page_count' => 384, 'language' => 'id', 'genres' => ['fiction']],
        ['title' => 'Bumi', 'author' => 'Tere Liye', 'isbn' => '9786022910058', 'description' => 'Petualangan Raib dan teman-temannya di dunia paralel penuh misteri.', 'page_count' => 440, 'language' => 'id', 'genres' => ['fiction', 'fantasy']],
        ['title' => 'Rindu Setengah Mati', 'author' => 'Eka Kirana', 'isbn' => '9786020251832', 'description' => 'Kisah cinta yang penuh liku dan pengorbanan.', 'page_count' => 320, 'language' => 'id', 'genres' => ['romance']],
        ['title' => 'Negeri Van Oranje', 'author' => 'Ahmad Fuadi', 'isbn' => '9789790818638', 'description' => 'Lanjutan perjalanan para santri menempuh studi di Belanda.', 'page_count' => 400, 'language' => 'id', 'genres' => ['fiction']],
        ['title' => 'Ketika Cinta Bertasbih', 'author' => 'Habiburrahman El Shirazy', 'isbn' => '9789791291400', 'description' => 'Kisah cinta Azzam dan Anna yang berlandaskan nilai keimanan.', 'page_count' => 368, 'language' => 'id', 'genres' => ['fiction', 'romance']],
        ['title' => 'Dilan 1990', 'author' => 'Pidi Baiq', 'isbn' => '9786020320064', 'description' => 'Kisah remaja Bandung yang polos, lucu, dan penuh kenangan.', 'page_count' => 332, 'language' => 'id', 'genres' => ['fiction', 'romance', 'comedy']],
        ['title' => 'Malam Minggu di Bowonk', 'author' => 'Raditya Dika', 'isbn' => '9789792283629', 'description' => 'Kumpulan cerita humor tentang cinta dan kegagalan yang menghibur.', 'page_count' => 240, 'language' => 'id', 'genres' => ['comedy', 'fiction']],
        ['title' => 'Lelaki Harimau', 'author' => 'Eka Kurniawan', 'isbn' => '9786020301834', 'description' => 'Dongeng gelap dari Halimunda yang memadukan realisme dan mitos.', 'page_count' => 312, 'language' => 'id', 'genres' => ['fiction']],
        ['title' => 'Cantik Itu Luka', 'author' => 'Eka Kurniawan', 'isbn' => '9789794336351', 'description' => 'Roman epik yang menyatu dengan sejarah dan mitologi Indonesia.', 'page_count' => 470, 'language' => 'id', 'genres' => ['fiction', 'history']],
        ['title' => 'Nanti Kita Cerita Tentang Hari Ini', 'author' => 'Marchella FP', 'isbn' => '9786020955020', 'description' => 'Perjalanan empat saudara menghadapi keluarga dan impian masing-masing.', 'page_count' => 360, 'language' => 'id', 'genres' => ['fiction']],
        ['title' => 'Gong', 'author' => 'Intan Paramaditha', 'isbn' => '9786024793451', 'description' => 'Kumpulan cerita horor kontemporer dengan nuansa budaya Indonesia.', 'page_count' => 280, 'language' => 'id', 'genres' => ['horror', 'fiction']],
        ['title' => '99 Cahaya di Langit Eropa', 'author' => 'Hanum Rais & Rangga Almahendra', 'isbn' => '9789792266790', 'description' => 'Perjalanan spiritual dan intelektual di berbagai kota Eropa.', 'page_count' => 392, 'language' => 'id', 'genres' => ['non-fiction']],
        ['title' => 'Ayat-Ayat Cinta', 'author' => 'Habiburrahman El Shirazy', 'isbn' => '9789791291394', 'description' => 'Kisah Fahri, mahasiswa Indonesia di Mesir yang diuji cinta dan iman.', 'page_count' => 380, 'language' => 'id', 'genres' => ['fiction', 'romance']],
        ['title' => 'Mata Amatir', 'author' => 'Bung Moko', 'isbn' => '9789792283643', 'description' => 'Kisah lucu sekelompok mahasiswa arsitektur dengan mimpi besar.', 'page_count' => 296, 'language' => 'id', 'genres' => ['comedy', 'fiction']],
        ['title' => 'Pulang', 'author' => 'Leila S. Chudori', 'isbn' => '9786020301865', 'description' => 'Novel tentang eksil, ingatan, dan pulang ke tanah air.', 'page_count' => 390, 'language' => 'id', 'genres' => ['fiction', 'history']],
        ['title' => 'Seperti Dendam, Rindu Harus Dibayar Tuntas', 'author' => 'Eka Kurniawan', 'isbn' => '9786024790047', 'description' => 'Kisah cinta dan dendam di desa Halimunda pasca-kemerdekaan.', 'page_count' => 416, 'language' => 'id', 'genres' => ['fiction']],
        ['title' => 'Jalan Lain ke Ibadah Haji', 'author' => 'Tata Sudrajat', 'isbn' => '9789799106913', 'description' => 'Memoar perjalanan spiritual dan refleksi kehidupan.', 'page_count' => 280, 'language' => 'id', 'genres' => ['biography', 'non-fiction']],
        ['title' => 'Negeri Keturunan', 'author' => 'Taufik Effendi', 'isbn' => '9789799106920', 'description' => 'Novel sejarah tentang identitas dan warisan budaya.', 'page_count' => 360, 'language' => 'id', 'genres' => ['fiction', 'history']],
        ['title' => 'OKA', 'author' => 'Pramoedya Ananta Toer', 'isbn' => '9789799106937', 'description' => 'Cerita tentang perjuangan seorang wanita di tengah tatanan kolonial.', 'page_count' => 320, 'language' => 'id', 'genres' => ['fiction', 'history']],

        // International bestsellers
        ['title' => 'Atomic Habits', 'author' => 'James Clear', 'isbn' => '9780735211292', 'description' => 'A proven framework for building good habits and breaking bad ones.', 'page_count' => 320, 'language' => 'en', 'genres' => ['non-fiction']],
        ['title' => 'Sapiens', 'author' => 'Yuval Noah Harari', 'isbn' => '9780062316097', 'description' => 'A brief history of humankind from the Stone Age to the twenty-first century.', 'page_count' => 443, 'language' => 'en', 'genres' => ['science', 'history', 'non-fiction']],
        ['title' => '1984', 'author' => 'George Orwell', 'isbn' => '9780451524935', 'description' => 'A dystopian novel about totalitarian surveillance and thought control.', 'page_count' => 328, 'language' => 'en', 'genres' => ['fiction']],
        ['title' => 'To Kill a Mockingbird', 'author' => 'Harper Lee', 'isbn' => '9780061120084', 'description' => 'A classic novel of racial injustice and childhood innocence in the American South.', 'page_count' => 336, 'language' => 'en', 'genres' => ['fiction']],
        ['title' => 'Pride and Prejudice', 'author' => 'Jane Austen', 'isbn' => '9780141439518', 'description' => 'A witty romance exploring manners, marriage, and morality in Regency England.', 'page_count' => 432, 'language' => 'en', 'genres' => ['fiction', 'romance']],
        ['title' => "Harry Potter and the Philosopher's Stone", 'author' => 'J.K. Rowling', 'isbn' => '9780747532699', 'description' => 'A young wizard discovers his magical heritage at Hogwarts School.', 'page_count' => 223, 'language' => 'en', 'genres' => ['fiction', 'fantasy']],
        ['title' => 'Harry Potter and the Chamber of Secrets', 'author' => 'J.K. Rowling', 'isbn' => '9780747538493', 'description' => 'Harry returns to Hogwarts to face a dark secret within the castle walls.', 'page_count' => 251, 'language' => 'en', 'genres' => ['fiction', 'fantasy']],
        ['title' => 'Harry Potter and the Prisoner of Azkaban', 'author' => 'J.K. Rowling', 'isbn' => '9780747542155', 'description' => 'Harry learns the truth about his parents and a fugitive from Azkaban.', 'page_count' => 317, 'language' => 'en', 'genres' => ['fiction', 'fantasy']],
        ['title' => 'The Lord of the Rings', 'author' => 'J.R.R. Tolkien', 'isbn' => '9780544003415', 'description' => 'An epic fantasy quest to destroy a powerful ring and save Middle-earth.', 'page_count' => 1178, 'language' => 'en', 'genres' => ['fiction', 'fantasy']],
        ['title' => 'The Hobbit', 'author' => 'J.R.R. Tolkien', 'isbn' => '9780547928227', 'description' => 'Bilbo Baggins embarks on an unexpected adventure with a company of dwarves.', 'page_count' => 310, 'language' => 'en', 'genres' => ['fiction', 'fantasy']],
        ['title' => 'The Alchemist', 'author' => 'Paulo Coelho', 'isbn' => '9780062315007', 'description' => 'A shepherd boy travels from Spain to Egypt in search of treasure and destiny.', 'page_count' => 208, 'language' => 'en', 'genres' => ['fiction']],
        ['title' => 'The Great Gatsby', 'author' => 'F. Scott Fitzgerald', 'isbn' => '9780743273565', 'description' => 'A portrait of decadence and longing in Jazz Age America.', 'page_count' => 180, 'language' => 'en', 'genres' => ['fiction']],
        ['title' => 'Think and Grow Rich', 'author' => 'Napoleon Hill', 'isbn' => '9781585424337', 'description' => 'Classic principles of personal achievement and wealth building.', 'page_count' => 320, 'language' => 'en', 'genres' => ['non-fiction']],
        ['title' => 'Rich Dad Poor Dad', 'author' => 'Robert T. Kiyosaki', 'isbn' => '9781612680194', 'description' => 'Lessons on money, investing, and financial literacy from two father figures.', 'page_count' => 336, 'language' => 'en', 'genres' => ['non-fiction']],
        ['title' => 'The Subtle Art of Not Giving a F*ck', 'author' => 'Mark Manson', 'isbn' => '9780062457714', 'description' => 'A counterintuitive approach to living a good life.', 'page_count' => 224, 'language' => 'en', 'genres' => ['non-fiction', 'philosophy']],
        ['title' => 'Ikigai', 'author' => 'Héctor García & Francesc Miralles', 'isbn' => '9781526420421', 'description' => 'The Japanese secret to a long and happy life.', 'page_count' => 208, 'language' => 'en', 'genres' => ['philosophy', 'non-fiction']],
        ['title' => 'The 7 Habits of Highly Effective People', 'author' => 'Stephen R. Covey', 'isbn' => '9781982137274', 'description' => 'Timeless principles for personal and professional effectiveness.', 'page_count' => 432, 'language' => 'en', 'genres' => ['non-fiction']],
        ['title' => 'Gone Girl', 'author' => 'Gillian Flynn', 'isbn' => '9780307588364', 'description' => 'A psychological thriller about a marriage gone terribly wrong.', 'page_count' => 432, 'language' => 'en', 'genres' => ['fiction', 'mystery-thriller']],
        ['title' => 'The Da Vinci Code', 'author' => 'Dan Brown', 'isbn' => '9780307474278', 'description' => 'A symbologist unravels a murder mystery tied to secret societies.', 'page_count' => 489, 'language' => 'en', 'genres' => ['fiction', 'mystery-thriller']],
        ['title' => 'The Hunger Games', 'author' => 'Suzanne Collins', 'isbn' => '9780439023481', 'description' => 'A dystopian fight for survival broadcast as televised entertainment.', 'page_count' => 374, 'language' => 'en', 'genres' => ['fiction', 'fantasy']],
        ['title' => 'The Kite Runner', 'author' => 'Khaled Hosseini', 'isbn' => '9781594631931', 'description' => 'A story of friendship, betrayal, and redemption in Afghanistan.', 'page_count' => 371, 'language' => 'en', 'genres' => ['fiction']],
        ['title' => 'Educated', 'author' => 'Tara Westover', 'isbn' => '9780399590504', 'description' => 'A memoir of growing up isolated and pursuing education against all odds.', 'page_count' => 334, 'language' => 'en', 'genres' => ['biography', 'non-fiction']],
        ['title' => 'Becoming', 'author' => 'Michelle Obama', 'isbn' => '9781524763138', 'description' => 'Memoir of the former First Lady of the United States.', 'page_count' => 448, 'language' => 'en', 'genres' => ['biography']],
        ['title' => 'Steve Jobs', 'author' => 'Walter Isaacson', 'isbn' => '9781451648539', 'description' => 'Authorized biography of the Apple co-founder and visionary.', 'page_count' => 656, 'language' => 'en', 'genres' => ['biography']],
        ['title' => 'A Brief History of Time', 'author' => 'Stephen Hawking', 'isbn' => '9780553380163', 'description' => 'An accessible exploration of cosmology, black holes, and the universe.', 'page_count' => 256, 'language' => 'en', 'genres' => ['science']],
        ['title' => 'Thinking, Fast and Slow', 'author' => 'Daniel Kahneman', 'isbn' => '9780374533557', 'description' => 'Nobel laureate explains the two systems that drive human thought.', 'page_count' => 499, 'language' => 'en', 'genres' => ['science', 'non-fiction']],
        ['title' => 'The Lean Startup', 'author' => 'Eric Ries', 'isbn' => '9780307887894', 'description' => 'How constant innovation creates radically successful businesses.', 'page_count' => 336, 'language' => 'en', 'genres' => ['non-fiction']],
        ['title' => 'Deep Work', 'author' => 'Cal Newport', 'isbn' => '9781455586691', 'description' => 'Rules for focused success in a distracted world.', 'page_count' => 296, 'language' => 'en', 'genres' => ['non-fiction']],
        ['title' => "Man's Search for Meaning", 'author' => 'Viktor E. Frankl', 'isbn' => '9780807014295', 'description' => 'A psychiatrist reflects on finding purpose amid unimaginable suffering.', 'page_count' => 184, 'language' => 'en', 'genres' => ['philosophy', 'biography']],
        ['title' => 'The Catcher in the Rye', 'author' => 'J.D. Salinger', 'isbn' => '9780316769174', 'description' => 'Holden Caulfield navigates alienation and adolescence in New York City.', 'page_count' => 277, 'language' => 'en', 'genres' => ['fiction']],
        ['title' => 'Brave New World', 'author' => 'Aldous Huxley', 'isbn' => '9780060850524', 'description' => 'A chilling vision of a genetically engineered utopian society.', 'page_count' => 311, 'language' => 'en', 'genres' => ['fiction', 'science']],
        ['title' => 'The Shining', 'author' => 'Stephen King', 'isbn' => '9780307743657', 'description' => 'A family faces supernatural horror while caretaking an isolated hotel.', 'page_count' => 447, 'language' => 'en', 'genres' => ['horror', 'fiction']],
        ['title' => 'It', 'author' => 'Stephen King', 'isbn' => '9781501142970', 'description' => 'Seven friends confront an ancient evil that returns to their hometown.', 'page_count' => 1138, 'language' => 'en', 'genres' => ['horror', 'fiction']],
        ['title' => 'The Fault in Our Stars', 'author' => 'John Green', 'isbn' => '9780525478812', 'description' => 'Two teenagers with cancer fall in love and grapple with mortality.', 'page_count' => 313, 'language' => 'en', 'genres' => ['fiction', 'romance']],
        ['title' => 'The Little Prince', 'author' => 'Antoine de Saint-Exupéry', 'isbn' => '9780156012195', 'description' => 'A poetic fable about wonder, love, and what truly matters.', 'page_count' => 96, 'language' => 'en', 'genres' => ['fiction', 'philosophy']],
    ];

    return array_map(static function (array $book): array {
        $isbn = $book['isbn'];
        $metadata = $book['metadata'] ?? [];
        $metadata['cover_url'] ??= "https://covers.openlibrary.org/b/isbn/{$isbn}-L.jpg";

        $book['metadata'] = $metadata;

        return $book;
    }, $books);
})();
