import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',    // iPhone 6, iPhone X, iPhone SE
        'sm': '640px',    // Default Tailwind small
        'md': '768px',    // Default Tailwind medium
        'lg': '1024px',   // Default Tailwind large
        'xl': '1280px',   // Default Tailwind xl
        '2xl': '1536px',  // Default Tailwind 2xl
        'iphone-6': '375px',
        'iphone-7-plus': '414px',
        'iphone-15-pro-max': '430px',
        'iphone-large': '480px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "fade-out": "1s fadeOut 3s ease-out forwards",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};
export default config;
