import Fuse, { type IFuseOptions } from 'fuse.js';

const DEFAULT_FUSE_OPTIONS = {
    threshold: 0.35,
    ignoreLocation: true,
} satisfies Partial<IFuseOptions<unknown>>;

export function filterWithFuse<T>(
    items: T[],
    keys: string[],
    query: string,
    options?: IFuseOptions<T>,
): T[] {
    const trimmed = query.trim();

    if (!trimmed) {
        return items;
    }

    const fuse = new Fuse(items, {
        ...DEFAULT_FUSE_OPTIONS,
        keys,
        ...options,
    });

    return fuse.search(trimmed).map((result) => result.item);
}
