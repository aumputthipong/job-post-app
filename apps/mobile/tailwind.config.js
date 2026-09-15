const { colors } = require("./src/lib/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
