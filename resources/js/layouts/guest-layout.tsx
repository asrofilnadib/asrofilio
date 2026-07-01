import type { ReactNode } from 'react';

import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

import { home } from '@/routes';

type GuestLayoutProps = {
    children: ReactNode;
    title?: string;
};

function GuestLayout({ children, title }: GuestLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
            <div className="mb-8 text-center">
                <Link
                    href={home.url()}
                    className="inline-flex items-center gap-2 text-primary"
                >
                    <BookOpen className="size-8" />
                    <span className="font-serif text-3xl font-bold tracking-tight">
                        Folio
                    </span>
                </Link>
                {title && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        {title}
                    </p>
                )}
            </div>
            <div className="w-full max-w-md">{children}</div>
        </div>
    );
}

export default GuestLayout;
