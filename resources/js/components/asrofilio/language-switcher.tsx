import { Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Locale, setLocale, useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const locales: Array<{ value: Locale; label: string }> = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Bahasa Indonesia' },
];

function LanguageSwitcher({ className }: { className?: string }) {
    const { locale, t } = useI18n();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('text-muted-foreground hover:text-foreground', className)}
                    title={t('language_label')}
                >
                    <Globe className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{t('language_label')}</DropdownMenuLabel>
                {locales.map(({ value, label }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => value !== locale && setLocale(value)}
                        className={cn(locale === value && 'bg-accent font-medium')}
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { LanguageSwitcher };
