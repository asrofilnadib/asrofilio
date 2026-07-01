const quotes = [
    {
        text: 'I am entirely made of flaws, stitched together with good intentions.',
        author: 'Augusten Burroughs',
    },
    {
        text: 'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
        author: 'George R.R. Martin',
    },
    {
        text: 'The more that you read, the more things you will know. The more that you learn, the more places you\'ll go.',
        author: 'Dr. Seuss',
    },
    {
        text: 'Books are a uniquely portable magic.',
        author: 'Stephen King',
    },
    {
        text: 'Reading is essential for those who seek to rise above the ordinary.',
        author: 'Jim Rohn',
    },
] as const;

function getDailyQuote(): (typeof quotes)[number] {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
            86_400_000,
    );

    return quotes[dayOfYear % quotes.length];
}

export { getDailyQuote };
