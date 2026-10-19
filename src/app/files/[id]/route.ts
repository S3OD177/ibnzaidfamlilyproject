import { getSession } from "@/lib/auth/current";
import { ALLOWED_TYPES, getFile, getPhotoOwners } from "@/lib/files";

import { canSee, readPrivacy, type Viewer } from "@/lib/privacy";
import { isStaff } from "@/lib/auth/session";

// Serves an uploaded file. Members-only files need a signed-in account.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const file = await getFile(id);
    if (!file) return new Response("Not found", { status: 404 });

    const session = await getSession();
    const viewer: Viewer = !session ? { kind: "anon" } : isStaff(session.role)
        ? { kind: "staff" } : { kind: "member", memberId: session.memberId };
    const owners = await getPhotoOwners(id);
    // Shared files obey every owner's restriction, so reuse cannot bypass privacy.
    const deniedPhoto = owners.some(owner =>
        (viewer.kind === "anon" && owner.isPublic !== 1) ||
        !canSee(readPrivacy(owner.privacy).photo, viewer, owner.id));
    if (deniedPhoto || (file.visibility === "members" && !session)) {
        if (session) return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "private, no-store" } });
        const login = new URL("/portal/login", request.url);
        login.searchParams.set("next", `/files/${id}`);
        return new Response(null, { status: 303, headers: { Location: `${login.pathname}${login.search}`, "Cache-Control": "private, no-store" } });
    }

    const download = new URL(request.url).searchParams.has("download");
    const inline = !download && ALLOWED_TYPES[file.mimeType]?.inline;
    const asciiName = file.name.replace(/[^\x20-\x7E]/g, "_");
    const data = new Uint8Array(file.data);
    const total = data.length;
    // Byte ranges let audio and video seek (Safari will not play media without them).
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
    let body = data;
    let status = 200;
    let contentRange: string | null = null;
    if (range && (range[1] || range[2])) {
        let start = range[1] ? Number(range[1]) : Math.max(0, total - Number(range[2]));
        let end = range[1] && range[2] ? Number(range[2]) : total - 1;
        end = Math.min(end, total - 1);
        start = Math.max(0, start);
        if (start > end || start >= total) {
            return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
        }
        body = data.subarray(start, end + 1);
        status = 206;
        contentRange = `bytes ${start}-${end}/${total}`;
    }
    return new Response(body, {
        status,
        headers: {
            "Content-Type": file.mimeType,
            "Content-Length": String(body.length),
            "Accept-Ranges": "bytes",
            ...(contentRange ? { "Content-Range": contentRange } : {}),
            "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
            // Permissions can change even when the bytes do not. Never cache access decisions.
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox",
        },
    });
}
