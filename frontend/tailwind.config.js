/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: { preflight: false }, // keep existing game styles intact
  theme: {
    extend: {
      colors: {
        mm: {
          bg:       "#09050f",
          panel:    "#160d22",
          dark:     "#070410",
          navy:     "#0e0c16",
          gold:     "#f2c14e",
          "gold-d": "#8f6a2f",
          purple:   "#8b3ec6",
          "purple-l": "#c084fc",
          text:     "#f4e6bf",
          muted:    "#a89e94",
          red:      "#ef4444",
          green:    "#65a30d",
        },
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "22px",
      },
    },
  },
  plugins: [],
};
