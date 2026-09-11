// Colors taken from the March 2026 redesign in apps/mobile (Login, Register,
// Home, MyProFile, job list/detail screens) — a continuation, not a reset.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#083C6B",
          light: "#2B6CB0",
        },
        background: "#F5F7FA",
        surface: "#FFFFFF",
        border: {
          DEFAULT: "#E4E9F2",
          strong: "#CBD5E1",
        },
        text: {
          DEFAULT: "#333333",
          muted: "#666666",
          subtle: "#64748B",
        },
        accent: "#FF9800",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
