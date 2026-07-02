import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    BookText,
    FileText,
    Globe,
    LayoutDashboard,
    LogOut,
    Tag,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { LanguageSwitcher } from '@/components/asrofilio/language-switcher';
import { ThemeSwitcher } from '@/components/asrofilio/theme-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { home, logout } from '@/routes';
import type { Auth } from '@/types/auth';

type AdminLayoutProps = {
    children: ReactNode;
};

const navItems = [
    { label: 'Dashboard', href: paths.admin.dashboard, icon: LayoutDashboard },
    { label: 'Books', href: paths.admin.books, icon: BookOpen },
    { label: 'Genres', href: paths.admin.genres, icon: BookText },
    { label: 'Languages', href: paths.admin.languages, icon: Globe },
    { label: 'Tags', href: paths.admin.tags, icon: Tag },
    { label: 'Users', href: paths.admin.users, icon: Users },
    { label: 'Logs', href: paths.admin.logs, icon: FileText },
] as const;

function AdminLayout({ children }: AdminLayoutProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUrl = usePage().url;

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
                <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
                    <BookOpen className="size-6 text-primary" />
                    <span className="font-serif text-xl font-bold text-sidebar-foreground">
                        Asrofilio Admin
                    </span>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive =
                            currentUrl === href ||
                            (href !== paths.admin.dashboard &&
                                currentUrl.startsWith(href));

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                )}
                            >
                                <Icon className="size-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <Separator />
                <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between px-3">
                        <p className="truncate text-xs text-muted-foreground">
                            {auth.user?.name}
                        </p>
                        <div className="flex items-center gap-1">
                            <LanguageSwitcher />
                            <ThemeSwitcher />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            asChild
                        >
                            <Link href={home.url()}>Back to Asrofilio</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-destructive hover:text-destructive"
                            asChild
                        >
                            <Link
                                href={logout.url()}
                                method="post"
                                as="button"
                            >
                                <LogOut className="size-4" />
                                Logout
                            </Link>
                        </Button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 overflow-auto">
                <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}

export default AdminLayout;
