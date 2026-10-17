// Server actions return their outcome instead of throwing: in production Next.js hides
// the message of an error thrown from a server action, so users would only see a generic
// React error. Throw ActionError for messages meant for the user; anything else is
// reported as a generic failure (and logged) so internals never reach the browser.

export class ActionError extends Error {}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function safeAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await fn() };
    } catch (error) {
        if (error instanceof ActionError) return { ok: false, error: error.message };
        console.error("[action] unexpected error:", error);
        return { ok: false, error: "حدث خطأ غير متوقع، حاول مرة أخرى" };
    }
}

/** Client side: resolves to the data or throws an Error carrying the user-facing message. */
export async function unwrap<T>(result: Promise<ActionResult<T>>): Promise<T> {
    const res = await result;
    if (!res.ok) throw new Error(res.error);
    return res.data;
}
