import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EE",
        parchment: "#F1E8D8",
        espresso: "#2B1D14",
        roast: "#4A3324",
        gold: "#C4922C",
        "gold-dark": "#9C6F1E",
        pine: "#33513F",
        "pine-dark": "#233A2C",
        clay: "#B54F3A",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "'Times New Roman'", "serif"],
        body: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
      },
      borderRadius: {
        card: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
