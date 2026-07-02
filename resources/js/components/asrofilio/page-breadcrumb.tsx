import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type PageBreadcrumbItem = {
    label: string;
    href?: string;
};

type PageBreadcrumbProps = {
    items: PageBreadcrumbItem[];
    className?: string;
};

function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn('mb-6', className)}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                {items.map((item, index) => (
                    <li
                        key={`${item.label}-${index}`}
                        className="flex min-w-0 items-center gap-1.5"
                    >
                        {index > 0 ? (
                            <ChevronRight
                                className="size-3.5 shrink-0"
                                aria-hidden
                            />
                        ) : null}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-foreground"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="truncate font-medium text-foreground">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

export { PageBreadcrumb, type PageBreadcrumbItem };
