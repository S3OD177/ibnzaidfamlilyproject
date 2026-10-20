export function countdownParts(target: string, now: number) {
    const remaining = Date.parse(target) - now;
    const total = Number.isFinite(remaining) ? Math.max(0, Math.ceil(remaining / 1000)) : 0;
    return [Math.floor(total / 86400), Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60];
}
