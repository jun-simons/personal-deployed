import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        rule: "var(--rule)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial", "sans-serif"],
        mono: ["var(--font-mono-light)", "Menlo", "Consolas", "Courier New", "monospace"],
        monoreg: ["var(--font-mono-regular)", "Menlo", "Consolas", "Courier New", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--foreground)",
            "--tw-prose-headings": "var(--foreground)",
            "--tw-prose-bold": "var(--foreground)",
            "--tw-prose-links": "var(--foreground)",
            "--tw-prose-bullets": "var(--muted)",
            "--tw-prose-counters": "var(--muted)",
            "--tw-prose-quotes": "var(--muted)",
            "--tw-prose-code": "var(--foreground)",
            "--tw-prose-hr": "var(--rule)",
            maxWidth: "none",
            a: {
              textDecorationColor: "var(--faint)",
              textUnderlineOffset: "4px",
              transition: "color 150ms, text-decoration-color 150ms",
            },
            "a:hover": {
              color: "#15803d",
              textDecorationColor: "#15803d",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            code: {
              fontWeight: "400",
              backgroundColor: "rgb(0 0 0 / 0.05)",
              padding: "0.1em 0.35em",
              borderRadius: "0.25rem",
            },
            pre: {
              backgroundColor: "rgb(0 0 0 / 0.06)",
              color: "var(--foreground)",
            },
            "pre code": { backgroundColor: "transparent", padding: "0" },
            img: { borderRadius: "0.25rem" },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
