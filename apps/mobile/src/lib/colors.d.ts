type Pastel = { bg: string; fg: string };

export declare const colors: {
  primary: { DEFAULT: string; dark: string; soft: string; tint: string; light: string };
  secondary: { DEFAULT: string; soft: string };
  background: string;
  surface: string;
  border: { DEFAULT: string; strong: string };
  text: { DEFAULT: string; muted: string; subtle: string };
  placeholder: string;
  accent: string;
  success: { DEFAULT: string; soft: string };
  danger: { DEFAULT: string; soft: string };
  onPrimary: string;
  pastel: Record<"peach" | "mint" | "butter" | "rose" | "sky" | "lilac", Pastel>;
};
