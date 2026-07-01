import { Link, usePage } from '@inertiajs/react';
import { BookOpen, LogIn, User } from 'lucide-react';

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

const navLinks = [
    { label: 'Home', href: home.url() },
    { label: 'Library', href: paths.library },
    { label: 'Highlights', href: paths.highlights },
    { label: 'Vocabulary', href: paths.vocabulary },
    { label: 'Analytics', href: paths.analytics },
] as const;

function TopNav() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUrl = usePage().url;
    const user = auth.user;

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link
                        href={home.url()}
                        className="flex items-center gap-2 text-primary"
                    >
                        <BookOpen className="size-7" />
                        <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                            Folio
                        </span>
                    </Link>
                    <nav className="hidden items-center gap-1 md:flex">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    currentUrl === href ||
                                        (href !== home.url() &&
                                            currentUrl.startsWith(href))
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt=""
                                            className="size-7 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <User className="size-4" />
                                        </div>
                                    )}
                                    <span className="hidden sm:inline">
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
        </header>
    );
}

export { TopNav };
