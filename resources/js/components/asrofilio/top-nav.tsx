import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookMarked,
    BookOpen,
    Highlighter,
    Home,
    Library,
    LogIn,
    LogOut,
    User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { home, login, logout, register } from '@/routes';
import type { Auth } from '@/types/auth';
import type { LucideIcon } from 'lucide-react';

const navLinks: Array<{ label: string; href: string; icon: LucideIcon }> = [
    { label: 'Home', href: home.url(), icon: Home },
    { label: 'Library', href: paths.library, icon: Library },
    { label: 'Highlights', href: paths.highlights, icon: Highlighter },
    { label: 'Vocabulary', href: paths.vocabulary, icon: BookMarked },
    { label: 'Analytics', href: paths.analytics, icon: BarChart3 },
];

function isNavActive(currentUrl: string, href: string): boolean {
    if (href === home.url()) {
        return currentUrl === href || currentUrl === '/';
    }

    return currentUrl === href || currentUrl.startsWith(`${href}?`) || currentUrl.startsWith(`${href}/`);
}

function TopNav() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUrl = usePage().url;
    const user = auth.user;

    return (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 lg:px-8">
                <Link
                    href={home.url()}
                    className="flex items-center gap-2.5 justify-self-start"
                >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <BookOpen className="size-5" />
                    </div>
                    <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                        Asrofilio
                    </span>
                </Link>

                <nav className="hidden items-center gap-0.5 rounded-full border border-border/70 bg-card/90 p-1 shadow-sm md:flex">
                    {navLinks.map(({ label, href, icon: Icon }) => {
                        const active = isNavActive(currentUrl, href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200',
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground',
                                )}
                            >
                                <Icon className="size-3.5" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-self-end gap-2">
                    {user ? (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hidden gap-2 sm:flex"
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt=""
                                                className="size-7 rounded-full object-cover ring-2 ring-border/60"
                                            />
                                        ) : (
                                            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-border/60">
                                                <User className="size-4" />
                                            </div>
                                        )}
                                        <span className="max-w-[120px] truncate">
                                            {user.name}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {user.role === 'admin' && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href={paths.admin.dashboard}>
                                                    Admin Panel
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href={paths.library}>My Library</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={logout.url()}
                                            method="post"
                                            as="button"
                                            className="w-full text-destructive"
                                        >
                                            Logout
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground"
                                asChild
                            >
                                <Link
                                    href={logout.url()}
                                    method="post"
                                    as="button"
                                    title="Logout"
                                >
                                    <LogOut className="size-4" />
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={login.url()}>
                                    <LogIn className="size-4" />
                                    Login
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href={register.url()}>Register</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto border-t border-border/40 px-4 py-2 md:hidden">
                {navLinks.map(({ label, href, icon: Icon }) => {
                    const active = isNavActive(currentUrl, href);

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-card text-muted-foreground',
                            )}
                        >
                            <Icon className="size-3" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}

export { TopNav };
