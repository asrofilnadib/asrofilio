import { Palette } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n';
import {
    applyTheme,
    defaultTheme,
    type ThemeId,
    themes,
} from '@/lib/themes';
import { cn } from '@/lib/utils';

function ThemeSwitcher({ className }: { className?: string }) {
    const { t } = useI18n();
    const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
        const stored = document.documentElement.getAttribute('data-theme');

        return (stored as ThemeId) || defaultTheme;
    });

    function handleSelect(themeId: ThemeId) {
        applyTheme(themeId);
        setActiveTheme(themeId);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('text-muted-foreground hover:text-foreground', className)}
                    title={t('theme_label')}
                >
                    <Palette className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{t('theme_label')}</DropdownMenuLabel>
                {themes.map((theme) => (
                    <DropdownMenuItem
                        key={theme.id}
                        onClick={() => handleSelect(theme.id)}
                        className={cn(
                            'flex items-center gap-3',
                            activeTheme === theme.id && 'bg-accent font-medium',
                        )}
                    >
                        <span className="flex gap-1">
                            {theme.swatches.map((color) => (
                                <span
                                    key={color}
                                    className="size-3 rounded-full border border-border/60"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </span>
                        <span className="flex flex-col">
                            <span>{theme.label}</span>
                            <span className="text-xs text-muted-foreground">
                                {theme.description}
                            </span>
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { ThemeSwitcher };
