import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            // make list markers use a darker gray (or `currentColor`)
            "ul > li::marker": {
              color: theme("colors.gray.800"),
              // or use "currentColor" to match your text:
              // color: "currentColor",
            },
          },
        },
      }),
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ['DotBold', 'Arial', 'sans-serif'],
        mono: ["InputMonoLight", "Menlo", "Consolas", "Courier New", "monospace"],
        monoreg: ["InputMonoRegular", "Menlo", "Consolas", "Courier New", "monospace"]

      }
    },
  },
  plugins: [
    typography
  ],
} satisfies Config;
