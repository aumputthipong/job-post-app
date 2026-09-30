// The app's palette, in one place: tailwind.config.js builds the class names from it and
// code that needs a raw value (icon colors, navigation options) imports it.
// CommonJS because the Tailwind config is loaded by Node.
//
// Split 60 / 30 / 10, orange as the brand (2026-09):
//   60  background + surface — light gray page, white cards.
//   30  orange tints (primary.soft / primary.tint) — panels, icon tiles, selected chips,
//       the facts panel, the Home banner's surroundings. This is what keeps screens from
//       looking washed out; ink stays for text only.
//   10  vivid orange (primary) — the main button, the active tab, the Home banner, key icons.
// Orange *text* uses primary.dark: the vivid orange is too light to read as small text.
//
// White on primary is ~3.2:1, enough for the large bold button labels (AA large) only.
const colors = {
  primary: { DEFAULT: "#EE6A0A", dark: "#C2410C", soft: "#FFF3EA", tint: "#FFE2CC", light: "#C2410C" },
  secondary: { DEFAULT: "#1F2430", soft: "#F1F2F5" },
  background: "#F7F7F9",
  surface: "#FFFFFF",
  border: { DEFAULT: "#ECEDF1", strong: "#D9DBE1" },
  text: { DEFAULT: "#1F2430", muted: "#5E6473", subtle: "#8A909C" },
  placeholder: "#A3A8B3",
  accent: "#F59E0B",
  success: { DEFAULT: "#15803D", soft: "#DCFCE7" },
  danger: { DEFAULT: "#B91C1C", soft: "#FEF2F2" },
  onPrimary: "#FFFFFF",
  // Pastel pairs for categories, like produce on a market stall: background + readable icon.
  pastel: {
    peach: { bg: "#FFE9DA", fg: "#C2410C" },
    mint: { bg: "#DCF4E6", fg: "#15803D" },
    butter: { bg: "#FFF1C2", fg: "#A16207" },
    rose: { bg: "#FFE1E7", fg: "#BE123C" },
    sky: { bg: "#DCEBFF", fg: "#1D4ED8" },
    lilac: { bg: "#ECE4FF", fg: "#6D28D9" },
  },
};

module.exports = { colors };
