// The app's palette, in one place: tailwind.config.js builds the class names from it and
// code that needs a raw value (icon colors, navigation options) imports it.
// CommonJS because the Tailwind config is loaded by Node.
//
// Split 60 / 30 / 10 (2026-09 redesign, replacing the navy #083C6B):
//   60  background + surface — the warm off-white page and white cards.
//   30  secondary (warm ink) — text, icons, icon tiles, selected chips, tags,
//       secondary buttons, finished steps. Carries structure without shouting.
//   10  primary (orange) — only what should draw the eye or be pressed: the main button
//       of a screen, the current tab and step, the key figure (pay), links, saved/unread.
// If orange starts marking structure (section icons, chips, tags), it has left its 10%.
//
// #D9480F keeps white text at ~5.5:1, so it passes AA on buttons and as text on white.
const colors = {
  primary: { DEFAULT: "#D9480F", light: "#C2410C", soft: "#FFF1E8" },
  secondary: { DEFAULT: "#292524", soft: "#EFEDEA" },
  background: "#FAFAF9",
  surface: "#FFFFFF",
  border: { DEFAULT: "#E7E5E4", strong: "#D6D3D1" },
  text: { DEFAULT: "#1C1917", muted: "#57534E", subtle: "#78716C" },
  placeholder: "#A8A29E",
  accent: "#F59E0B",
  success: { DEFAULT: "#15803D", soft: "#DCFCE7" },
  // Deeper than the primary's red-orange, so an error never reads as a highlight.
  danger: { DEFAULT: "#B91C1C", soft: "#FEF2F2" },
  onPrimary: "#FFFFFF",
};

module.exports = { colors };
