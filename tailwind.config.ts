import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "1rem",
        },
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#0fbd49", // Stitch: #0fbd49 or #0fbd0f - using the greener one
                    dark: "#0a8a0a",
                    light: "#dcfce7",
                },
                accent: "#102210",
                surface: "#ffffff",
                // Keeping "brand" for legacy/shadcn compatibility if needed, but aliasing to new primary
                brand: {
                    50: "#f0fdf4",
                    100: "#dcfce7",
                    200: "#bbf7d0", // Lightest green
                    300: "#86efac",
                    400: "#4ade80",
                    500: "#0fbd49",
                    600: "#16a34a",
                    700: "#15803d",
                    800: "#166534",
                    900: "#14532d",
                    950: "#052e16",
                },
            },
            fontFamily: {
                display: ["var(--font-newsreader)", "serif"],
                body: ["var(--font-cairo)", "sans-serif"],
                naskh: ["var(--font-naskh)", "serif"],
                sans: ["var(--font-cairo)", "sans-serif"],
            },
        },
    },
    plugins: [],
} satisfies Config;
