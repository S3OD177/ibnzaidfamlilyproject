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
    return new Response(new Uint8Array(file.data), {
        headers: {
            "Content-Type": file.mimeType,
            "Content-Length": String(file.sizeBytes),
            "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
            // File ids never change content, so public files can be cached for good.
            "Cache-Control": file.visibility === "public" ? "public, max-age=31536000, immutable" : "private, max-age=3600",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        },
    });
}
