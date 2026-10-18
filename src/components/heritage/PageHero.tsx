import { Ornament } from "./Ornament";

// Deep green banner with the gold star pattern that opens every public page.
export function PageHero({
    eyebrow,
    title,
    subtitle,
    children,
    size = "md",
}: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    size?: "md" | "lg";
}) {
    return (
        <section className="relative overflow-hidden bg-deep text-white">
            <div className="absolute inset-0 heritage-pattern opacity-[0.12]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-deep/80" />
            <div className={`relative max-w-4xl mx-auto px-4 text-center ${size === "lg" ? "py-20 md:py-28" : "py-14 md:py-20"}`}>
                {eyebrow && <p className="text-primary/90 text-sm font-bold tracking-wide mb-4">{eyebrow}</p>}
                <h1 className={`font-heritage font-bold text-primary leading-tight ${size === "lg" ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl"}`}>
                    {title}
                </h1>
                <Ornament light className="my-6" />
                {subtitle && <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-naskh">{subtitle}</p>}
                {children}
            </div>
        </section>
    );
}

/** Section title: small gold label, calligraphic heading, ornament. */
export function SectionHeading({
    eyebrow,
    title,
    align = "center",
    light = false,
}: {
    eyebrow?: string;
    title: string;
    align?: "center" | "start";
    light?: boolean;
}) {
    const center = align === "center";
    return (
        <div className={center ? "text-center" : "text-right"}>
            {eyebrow && <p className="text-primary-dark text-sm font-bold mb-2">{eyebrow}</p>}
            <h2 className={`font-heritage font-bold text-3xl md:text-4xl leading-snug ${light ? "text-white" : "text-deep"}`}>{title}</h2>
            <Ornament light={light} className={`mt-4 ${center ? "" : "justify-start"}`} />
        </div>
    );
}
