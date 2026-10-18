import { ImageResponse } from "next/og";

// The site icon: three linked people (a small family tree) in white on the gold theme.
// Rendered to PNG at the sizes browsers and phones ask for.
export function brandIcon(size: number, { padded = false } = {}) {
    const inset = padded ? size * 0.12 : 0; // room for Android's round mask
    return new ImageResponse(
        (
            <div style={{ width: size, height: size, display: "flex", background: padded ? "#D4AF37" : "transparent" }}>
                <div
                    style={{
                        margin: inset,
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#D4AF37",
                        borderRadius: padded ? 0 : size * 0.22,
                    }}
                >
                    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round">
                        <path d="M32 22v10M32 32H16v8M32 32h16v8" />
                        <circle cx="32" cy="14" r="8" fill="white" stroke="none" />
                        <circle cx="16" cy="48" r="8" fill="white" stroke="none" />
                        <circle cx="48" cy="48" r="8" fill="white" stroke="none" />
                    </svg>
                </div>
            </div>
        ),
        { width: size, height: size },
    );
}
