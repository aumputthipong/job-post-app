// The app's palette, in one place: tailwind.config.js builds the class names from it and
// code that needs a raw value (icon colors, navigation options) imports it.
// CommonJS because the Tailwind config is loaded by Node.
//
// Navy and indigo, the university app's own colors (#083C6B and #5A6BF5), laid out like the
// Thai job boards (2026-09):
//   secondary  navy — the frame: headers, the Home search band, job titles, section marks.
//   primary    indigo — what you tap: the main button, the current tab, links, selections.
//   fresh      amber — the one warm spot, "ใหม่" on a post.
// Indigo *text* uses primary.dark: white on the indigo is ~4.3:1, enough for the large bold
// button labels (AA large) only.
const colors = {
  primary: { DEFAULT: "#5A6BF5", dark: "#3F4FD8", soft: "#EEF0FE", tint: "#DDE2FD" },
  secondary: { DEFAULT: "#083C6B", soft: "#E6EDF5", deep: "#062E53" },
  background: "#F1F4F8",
  surface: "#FFFFFF",
  border: { DEFAULT: "#E2E8F0", strong: "#CBD5E1" },
  text: { DEFAULT: "#102A43", muted: "#44546A", subtle: "#66758C" },
  placeholder: "#94A3B8",
  accent: "#F59E0B",
  fresh: { DEFAULT: "#9A5B00", soft: "#FFF1D6" },
  success: { DEFAULT: "#15803D", soft: "#DCFCE7" },
  danger: { DEFAULT: "#B91C1C", soft: "#FEF2F2" },
  onPrimary: "#FFFFFF",
};

module.exports = { colors };
