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
        saffron: "#FF9933",
        forest: "#138808",
        chili: "#CC0000",
        cream: "#FFF8E7",
        charcoal: "#333333",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Poppins", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadein: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        fadein: "fadein 600ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
