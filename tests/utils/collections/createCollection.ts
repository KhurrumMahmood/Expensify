export default function createCollection<T>(createKey: (item: T, index: number) => string | number, createItem: (index: number) => T, length = 500): Record<string, T> {
    const map: Record<string, T> = {};

    for (let i = 0; i < length; i++) {
        const item = createItem(i);
        const itemKey = createKey(item, i);
        map[itemKey] = item;
    }

    return map;
}

export function createNestedCollection<T>(
    createParentKey: (item: T, index: number) => string | number,
    createKey: (item: T, index: number) => string | number,
    createItem: (index: number) => T,
    length = 500,
): Record<string, Record<string, T>> {
    const map: Record<string, Record<string, T>> = {};

    for (let i = 0; i < length; i++) {
        const item = createItem(i);
        const itemKey = createKey(item, i);
        const itemParentKey = createParentKey(item, i);
        map[itemParentKey] = {
            ...map[itemParentKey],
            [itemKey]: item,
        };
    }

    return map;
}
