import { getSession } from "@/lib/auth/current";
import { ALLOWED_TYPES, getFile } from "@/lib/files";

// Serves an uploaded file. Members-only files need a signed-in account.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const file = await getFile(id);
    if (!file) return new Response("Not found", { status: 404 });

    if (file.visibility === "members" && !(await getSession())) {
        const login = new URL("/portal/login", request.url);
        login.searchParams.set("next", `/files/${id}`);
        return new Response(null, { status: 303, headers: { Location: `${login.pathname}${login.search}` } });
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
            // File ids never change content, so public files can be cached for good.
            "Cache-Control": file.visibility === "public" ? "public, max-age=31536000, immutable" : "private, max-age=3600",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox",
        },
    });
}
