// =============================================================================
// IMPORT ESPAÑA — Mobile Design Tokens
// Mirrors ImportEspanaWeb/src/app/globals.css so both apps share one identity.
// Dark-first (default), light variant included for parity with the web theme.
// =============================================================================

export type ThemeMode = "dark" | "light";

export interface ThemeTokens {
  // Canvas
  background: string;
  backgroundElevated: string;
  foreground: string;

  // Surfaces
  surface: string;
  surfaceDim: string;
  surfaceElevated: string;
  surfacePopover: string;
  surfaceBorder: string;

  // Glass system
  glassBg: string;
  glassBgHover: string;
  glassBorder: string;
  glassBorderHover: string;
  glassHighlight: string;

  // Brand
  brandBlue: string;
  brandBlueLight: string;
  brandBlueDeep: string;
  brandGold: string;
  brandGoldLight: string;
  brandRed: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // Inputs
  inputBg: string;
  inputBgFocus: string;
  inputBorder: string;
  inputBorderFocus: string;

  // Pills / Chips
  pillBg: string;
  pillActiveBg: string;
  pillActiveBorder: string;

  // Semantic
  success: string;
  warning: string;
  error: string;

  // Hero gradient
  heroGradient: [string, string, string];

  // Gradient overlay (radial spotlight on top)
  spotlight: string;

  // Status bar
  statusBarStyle: "light" | "dark";
}

export const DARK: ThemeTokens = {
  background: "#080C14",
  backgroundElevated: "#0F1320",
  foreground: "#EEF2FF",

  surface: "rgba(255, 255, 255, 0.052)",
  surfaceDim: "rgba(255, 255, 255, 0.026)",
  surfaceElevated: "rgba(255, 255, 255, 0.08)",
  surfacePopover: "#171D2B",
  surfaceBorder: "rgba(255, 255, 255, 0.10)",

  glassBg: "rgba(255, 255, 255, 0.044)",
  glassBgHover: "rgba(255, 255, 255, 0.076)",
  glassBorder: "rgba(255, 255, 255, 0.10)",
  glassBorderHover: "rgba(255, 255, 255, 0.22)",
  glassHighlight: "rgba(255, 255, 255, 0.07)",

  brandBlue: "#5090F5",
  brandBlueLight: "#7AAEFF",
  brandBlueDeep: "#2C5ECC",
  brandGold: "#F5B300",
  brandGoldLight: "#FFD54A",
  brandRed: "#F87171",

  textPrimary: "#EEF2FF",
  textSecondary: "rgba(238, 242, 255, 0.60)",
  textTertiary: "rgba(238, 242, 255, 0.35)",

  inputBg: "rgba(255, 255, 255, 0.06)",
  inputBgFocus: "rgba(255, 255, 255, 0.09)",
  inputBorder: "rgba(255, 255, 255, 0.13)",
  inputBorderFocus: "#5090F5",

  pillBg: "rgba(255, 255, 255, 0.04)",
  pillActiveBg: "rgba(80, 144, 245, 0.15)",
  pillActiveBorder: "rgba(80, 144, 245, 0.42)",

  success: "#34D399",
  warning: "#FBB924",
  error: "#F87171",

  heroGradient: ["#2C5ECC", "#5090F5", "#7AAEFF"],

  spotlight: "rgba(80, 144, 245, 0.11)",
  statusBarStyle: "light",
};

export const LIGHT: ThemeTokens = {
  background: "#F4F1EB",
  backgroundElevated: "#FFFFFF",
  foreground: "#0A0F1E",

  surface: "rgba(255, 255, 255, 0.75)",
  surfaceDim: "rgba(237, 234, 226, 0.80)",
  surfaceElevated: "rgba(255, 255, 255, 0.92)",
  surfacePopover: "#FFFFFF",
  surfaceBorder: "rgba(10, 15, 30, 0.09)",

  glassBg: "rgba(255, 255, 255, 0.78)",
  glassBgHover: "rgba(255, 255, 255, 0.92)",
  glassBorder: "rgba(10, 15, 30, 0.10)",
  glassBorderHover: "rgba(10, 15, 30, 0.20)",
  glassHighlight: "rgba(255, 255, 255, 0.90)",

  brandBlue: "#1D4ED8",
  brandBlueLight: "#3B82F6",
  brandBlueDeep: "#1E3A8A",
  brandGold: "#B97A00",
  brandGoldLight: "#D97706",
  brandRed: "#DC2626",

  textPrimary: "#0A0F1E",
  textSecondary: "#4B5563",
  textTertiary: "#9CA3AF",

  inputBg: "rgba(255, 255, 255, 0.94)",
  inputBgFocus: "#FFFFFF",
  inputBorder: "rgba(10, 15, 30, 0.13)",
  inputBorderFocus: "#1D4ED8",

  pillBg: "rgba(0, 0, 0, 0.04)",
  pillActiveBg: "rgba(29, 78, 216, 0.09)",
  pillActiveBorder: "rgba(29, 78, 216, 0.32)",

  success: "#059669",
  warning: "#D97706",
  error: "#DC2626",

  heroGradient: ["#1E3A8A", "#1D4ED8", "#3B82F6"],

  spotlight: "rgba(29, 78, 216, 0.07)",
  statusBarStyle: "dark",
};

// Radii (px) — mirror web --radius-*
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Spacing scale (px) — mirror web --space-*
export const Space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

// Font families (loaded by expo-font in _layout)
export const Fonts = {
  sansRegular: "Geist_400Regular",
  sansMedium: "Geist_500Medium",
  sansSemibold: "Geist_600SemiBold",
  sansBold: "Geist_700Bold",
  sansExtraBold: "Geist_800ExtraBold",
  monoRegular: "GeistMono_400Regular",
  monoMedium: "GeistMono_500Medium",
  monoBold: "GeistMono_700Bold",
} as const;

// Backwards-compat shim — older code imports `Colors.primary` etc.
// Resolves to dark-mode tokens. Prefer `useTheme()` in new code.
export const Colors = {
  primary: DARK.brandBlue,
  secondary: DARK.brandGold,
  accent: DARK.brandBlueLight,
  background: DARK.background,
  white: "#FFFFFF",
  text: DARK.textPrimary,
  textLight: DARK.textSecondary,
  border: DARK.glassBorder,
  success: DARK.success,
  warning: DARK.warning,
  error: DARK.error,
} as const;
