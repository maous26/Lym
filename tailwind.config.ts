import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#10B981", // Emerald 500
                    50: "#ECFDF5",
                    100: "#D1FAE5",
                    200: "#A7F3D0",
                    300: "#6EE7B7",
                    400: "#34D399",
                    500: "#10B981",
                    600: "#059669",
                    700: "#047857",
                    800: "#065F46",
                    900: "#064E3B",
                },
                secondary: {
                    DEFAULT: "#F97316", // Orange 500
                    50: "#FFF7ED",
                    100: "#FFEDD5",
                    200: "#FED7AA",
                    300: "#FDBA74",
                    400: "#FB923C",
                    500: "#F97316",
                    600: "#EA580C",
                    700: "#C2410C",
                    800: "#9A3412",
                    900: "#7C2D12",
                },
                accent: {
                    DEFAULT: "#8B5CF6", // Violet 500
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
} satisfies Config;
