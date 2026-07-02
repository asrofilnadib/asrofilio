import { Moon, Settings2, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
    PdfReaderSettings,
    PdfReadingMode,
    PdfScaleMode,
    ReaderTheme,
} from '@/types/reader';

type ReaderSettingsPanelProps = {
    settings: PdfReaderSettings;
    onChange: (settings: PdfReaderSettings) => void;
    isPdf?: boolean;
    trigger?: React.ReactNode;
};

const themes: Array<{
    value: ReaderTheme;
    label: string;
    icon?: React.ReactNode;
    swatch: string;
}> = [
    {
        value: 'light',
        label: 'Light',
        icon: <Sun className="size-3.5" />,
        swatch: '#faf7f0',
    },
    {
        value: 'sepia',
        label: 'Sepia',
        swatch: '#f5f0e6',
    },
    {
        value: 'dark',
        label: 'Dark',
        icon: <Moon className="size-3.5" />,
        swatch: '#1a1816',
    },
    {
        value: 'dark_sepia',
        label: 'Dark Sepia',
        swatch: '#2d2926',
    },
];

function ReaderSettingsPanel({
    settings,
    onChange,
    isPdf = true,
    trigger,
}: ReaderSettingsPanelProps) {
    function update<K extends keyof PdfReaderSettings>(
        key: K,
        value: PdfReaderSettings[K],
    ) {
        onChange({ ...settings, [key]: value });
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                {trigger ?? (
                    <Button variant="ghost" size="icon" title="Reading settings">
                        <Settings2 className="size-4" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <Tabs defaultValue="display">
                    <TabsList className="w-full">
                        <TabsTrigger value="display" className="flex-1">
                            Display
                        </TabsTrigger>
                        {isPdf ? (
                            <TabsTrigger value="reading" className="flex-1">
                                Reading
                            </TabsTrigger>
                        ) : null}
                    </TabsList>

                    <TabsContent value="display" className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {themes.map(({ value, label, icon, swatch }) => (
                                    <Button
                                        key={value}
                                        type="button"
                                        size="sm"
                                        variant={
                                            settings.theme === value
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className="gap-1.5 justify-start"
                                        onClick={() => update('theme', value)}
                                    >
                                        <span
                                            className="size-3 shrink-0 rounded-full border border-border/60"
                                            style={{ backgroundColor: swatch }}
                                        />
                                        {icon}
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Font size</Label>
                                <span className="text-xs text-muted-foreground tabular-nums">
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
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {settings.lineHeight.toFixed(1)}
                                </span>
                            </div>
                            <Slider
                                value={[settings.lineHeight * 10]}
                                min={12}
                                max={20}
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
                                    onClick={() =>
                                        update('fontFamily', 'serif')
                                    }
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
                                    onClick={() =>
                                        update('fontFamily', 'sans')
                                    }
                                >
                                    Sans
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {isPdf ? (
                        <TabsContent value="reading" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Reading mode</Label>
                                <div className="flex gap-1">
                                    {(
                                        [
                                            {
                                                value: 'paged',
                                                label: 'Paged (flip)',
                                            },
                                            {
                                                value: 'continuous',
                                                label: 'Continuous',
                                            },
                                        ] as const
                                    ).map(({ value, label }) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            size="sm"
                                            variant={
                                                settings.readingMode === value
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="flex-1 text-xs"
                                            onClick={() =>
                                                update(
                                                    'readingMode',
                                                    value as PdfReadingMode,
                                                )
                                            }
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Scale</Label>
                                <div className="flex gap-1">
                                    {(
                                        [
                                            {
                                                value: 'fit-width',
                                                label: 'Fit width',
                                            },
                                            {
                                                value: 'fit-screen',
                                                label: 'Fit screen',
                                            },
                                        ] as const
                                    ).map(({ value, label }) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            size="sm"
                                            variant={
                                                settings.scaleMode === value
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="flex-1 text-xs"
                                            onClick={() =>
                                                update(
                                                    'scaleMode',
                                                    value as PdfScaleMode,
                                                )
                                            }
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-page-numbers">
                                    Show page numbers
                                </Label>
                                <Switch
                                    id="show-page-numbers"
                                    checked={settings.showPageNumbers}
                                    onCheckedChange={(checked) =>
                                        update('showPageNumbers', checked)
                                    }
                                />
                            </div>
                        </TabsContent>
                    ) : null}
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}

export { ReaderSettingsPanel };
