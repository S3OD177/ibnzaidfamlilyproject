/** Matches the legacy raffle's username-format rule; does not verify existence or following. */
export function extractRamadanXHandle(value: unknown): string | null {
    if (typeof value !== "string" || value.length > 300) return null;
    let candidate = value.trim().replace(/^@/, "");
    candidate = candidate.replace(/^https?:\/\/(www\.)?(x\.com|twitter\.com)\//i, "");
    candidate = candidate.replace(/^(www\.)?(x\.com|twitter\.com)\//i, "");
    candidate = candidate.split(/[/?#]/)[0]?.trim() ?? "";
    if (!/^[A-Za-z0-9_]{1,15}$/.test(candidate)) return null;
    if (["home", "explore", "notifications", "messages", "search", "hashtag", "i", "intent", "settings", "share"].includes(candidate.toLowerCase())) return null;
    return candidate;
}
