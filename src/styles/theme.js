const palette = {
  mcbRed: '#F97316',
  mcbRedDark: '#EA580C',
  mcbRedLight: 'rgba(249, 115, 22, 0.1)',
  orange500: '#FFA500',
  amber100: '#FEF3C7',
  red500: '#EF4444',
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray800: '#1F2937',
  gray900: '#111827',
  white: '#FFFFFF',
  black: '#000000',
  emerald500: '#10B981',
  emerald50: '#ECFDF5',
};

export const lightTheme = {
  mode: 'light',
  colors: {
    primary: palette.mcbRed,
    primaryDark: palette.mcbRedDark,
    primaryLight: palette.mcbRedLight,
    secondary: palette.mcbRedDark,
    background: palette.gray50,
    card: palette.white,
    text: palette.gray800,
    textLight: palette.gray500,
    border: palette.gray200,
    success: palette.emerald500,
    successLight: palette.emerald50,
    error: palette.red500,
    white: palette.white,
    black: palette.black,
    muted: palette.gray400,
    input: palette.gray100,
    overlay: 'rgba(0,0,0,0.5)',
    logout: palette.orange500,
  },
  spacing: { s: 8, m: 16, l: 24, xl: 32 },
  borderRadius: { s: 8, m: 12, l: 16, circle: 9999 },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: palette.mcbRed,
    primaryDark: palette.mcbRedDark,
    primaryLight: 'rgba(204, 0, 0, 0.2)', // transparent red
    secondary: palette.mcbRedDark,
    background: palette.gray900,
    card: palette.gray800,
    text: palette.gray50,
    textLight: palette.gray400,
    border: palette.gray500,
    success: palette.emerald500,
    successLight: 'rgba(16, 185, 129, 0.2)',
    error: palette.red500,
    white: palette.white, // In dark mode, 'white' might still be white for text on primary buttons
    black: palette.black,
    muted: palette.gray500,
    input: '#374151',
    overlay: 'rgba(0,0,0,0.7)',
    logout: palette.orange500,
  },
  spacing: { s: 8, m: 16, l: 24, xl: 32 },
  borderRadius: { s: 8, m: 12, l: 16, circle: 9999 },
};

export const colorBlindLightTheme = {
  ...lightTheme,
  mode: 'colorblind-light',
  colors: {
    ...lightTheme.colors,
    primary: '#0072B2', // Okabe-Ito Blue
    primaryDark: '#004c78',
    primaryLight: '#cce3f0',
    secondary: '#56B4E9', // Sky Blue
    success: '#009E73', // Bluish Green (Distinguishable from red/orange)
    successLight: '#e6f5f1',
    error: '#D55E00',   // Vermillion (High contrast error)
    muted: '#737373',
  }
};

export const colorBlindDarkTheme = {
  ...darkTheme,
  mode: 'colorblind-dark',
  colors: {
    ...darkTheme.colors,
    primary: '#56B4E9', // Sky Blue (More legible on dark)
    primaryDark: '#0072B2',
    primaryLight: 'rgba(86, 180, 233, 0.2)',
    secondary: '#E69F00',
    success: '#009E73',
    successLight: 'rgba(0, 158, 115, 0.15)',
    error: '#D55E00',
    muted: '#a3a3a3',
  }
};

const theme = lightTheme;
export default theme;
