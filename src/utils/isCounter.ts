
export function isCounter(obj: any): obj is { count: number } {
    return obj && typeof obj.count === "number";
}
