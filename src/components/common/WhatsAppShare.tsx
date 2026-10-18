"use client";

/** Opens WhatsApp with a title and a link to this site, ready to send to the family group. */
export default function WhatsAppShare({ text, path, className = "", label = "واتساب" }: { text: string; path?: string; className?: string; label?: string }) {
    return (
        <button
            type="button"
            onClick={() => {
                const url = `${window.location.origin}${path ?? window.location.pathname}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener");
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold bg-[#25D366]/10 text-[#128C4B] hover:bg-[#25D366]/20 ${className}`}
            aria-label="مشاركة عبر واتساب"
        >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
            </svg>
            {label}
        </button>
    );
}
