import { Moon, Sun, Type } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { ReaderTheme, TextSettings } from '@/types/reader';

type TextSettingsPopoverProps = {
    settings: TextSettings;
    onChange: (settings: TextSettings) => void;
    trigger?: React.ReactNode;
};

const themes: Array<{ value: ReaderTheme; label: string; icon?: React.ReactNode }> = [
    { value: 'light', label: 'Light', icon: <Sun className="size-3.5" /> },
    { value: 'sepia', label: 'Sepia' },
    { value: 'dark', label: 'Dark', icon: <Moon className="size-3.5" /> },
];

function TextSettingsPopover({
    settings,
    onChange,
    trigger,
}: TextSettingsPopoverProps) {
    function update<K extends keyof TextSettings>(
        key: K,
        value: TextSettings[K],
    ) {
        onChange({ ...settings, [key]: value });
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                {trigger ?? (
                    <Button variant="ghost" size="icon">
                        <Type className="size-4" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="flex gap-1">
                            {themes.map(({ value, label, icon }) => (
                                <Button
                                    key={value}
                                    type="button"
                                    size="sm"
                                    variant={
                                        settings.theme === value
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className="flex-1 gap-1"
                                    onClick={() => update('theme', value)}
                                >
                                    {icon}
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Font size</Label>
                            <span className="text-xs text-muted-foreground">
                                {settings.fontSize}px
                            </span>
                        </div>
                        <Slider
                            value={[settings.fontSize]}
                            min={14}
                            max={28}
                            step={1}
                            onValueChange={([value]) =>
                                update('fontSize', value ?? 18)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Line height</Label>
                            <span className="text-xs text-muted-foreground">
                                {settings.lineHeight.toFixed(1)}
                            </span>
                        </div>
                        <Slider
                            value={[settings.lineHeight * 10]}
                            min={12}
                            max={22}
                            step={1}
                            onValueChange={([value]) =>
                                update('lineHeight', (value ?? 16) / 10)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Font</Label>
                        <div className="flex gap-1">
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    settings.fontFamily === 'serif'
                                        ? 'default'
                                        : 'outline'
                                }
                                className={cn('flex-1 font-serif')}
                                onClick={() => update('fontFamily', 'serif')}
                            >
                                Serif
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    settings.fontFamily === 'sans'
                                        ? 'default'
                                        : 'outline'
                                }
                                className="flex-1"
                                onClick={() => update('fontFamily', 'sans')}
                            >
                                Sans
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export { TextSettingsPopover };
