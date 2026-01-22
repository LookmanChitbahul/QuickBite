const palette = {
  amber500: '#F59E0B',
  amber600: '#D97706',
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
    primary: palette.amber500,
    primaryDark: palette.amber600,
    primaryLight: palette.amber100,
    secondary: palette.red500,
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
  },
  spacing: { s: 8, m: 16, l: 24, xl: 32 },
  borderRadius: { s: 8, m: 12, l: 16, circle: 9999 },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: palette.amber500,
    primaryDark: palette.amber600,
    primaryLight: 'rgba(245, 158, 11, 0.2)', // transparent amber
    secondary: palette.red500,
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
  },
  spacing: { s: 8, m: 16, l: 24, xl: 32 },
  borderRadius: { s: 8, m: 12, l: 16, circle: 9999 },
};

const theme = lightTheme; // Default export for backwards compatibility
export default theme;
