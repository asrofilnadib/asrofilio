export const themes = [
    {
        id: 'folio',
        label: 'Folio',
        description: 'Olive & cream',
        swatches: ['#7d7517', '#faf7f0'],
    },
    {
        id: 'sage',
        label: 'Sage',
        description: 'Soft green & mist',
        swatches: ['#5a7a5e', '#f7faf7'],
    },
    {
        id: 'slate',
        label: 'Slate',
        description: 'Cool gray & paper',
        swatches: ['#4a6274', '#f8f9fb'],
    },
    {
        id: 'walnut',
        label: 'Walnut',
        description: 'Warm brown & linen',
        swatches: ['#6b4f3a', '#faf6f2'],
    },
] as const;

export type ThemeId = (typeof themes)[number]['id'];

export const defaultTheme: ThemeId = 'folio';

export const themeStorageKey = 'asrofilio-theme';

/** Inertia progress bar color — resolves from the active theme's `--primary`. */
export const inertiaProgressColor = 'var(--primary)';

export function applyTheme(themeId: ThemeId): void {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem(themeStorageKey, themeId);
}

export function initTheme(): ThemeId {
    const stored = localStorage.getItem(themeStorageKey) as ThemeId | null;
    const themeId =
        stored && themes.some((theme) => theme.id === stored)
            ? stored
            : defaultTheme;

    applyTheme(themeId);

    return themeId;
}
