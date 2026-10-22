import { createTheme } from '@mui/material/styles';

/**
 * SkillBridge AI Theme
 * Designed with an editorial, calm, and trustworthy aesthetic.
 * Strict adherence to:
 * - Soft lavender-grey background (#F1F0F6)
 * - Near-black ink (#17161C)
 * - Single muted indigo accent (#4F46A5)
 * - Playfair Display headings + Open Sans body
 * - 8px cards/inputs, 6px buttons
 * - 1px borders (#DDDBE8) without heavy drop-shadows
 */

export const colors = {
  bg: '#F1F0F6',
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F6FA',
  panel: '#EAE8F2',
  border: '#DDDBE8',
  borderLight: '#E8E7F0',
  ink: '#17161C',
  inkSecondary: '#5A5868',
  inkTertiary: '#8D8A9D',
  accent: '#4F46A5',
  accentHover: '#423A8F',
  accentLight: '#EEEDF8',
  accentBorder: '#D2CEEE',
  success: '#2E7D5B',
  successBg: '#EDF7F2',
  successBorder: '#C6E7D8',
  warning: '#B26A18',
  warningBg: '#FDF5EC',
  warningBorder: '#F6DEBF',
  error: '#B43B3B',
  errorBg: '#FDF0F0',
  errorBorder: '#F5C6C6',
  info: '#3E6F9F',
  infoBg: '#EFF5FA',
  infoBorder: '#C9DFEE',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.accent,
      dark: colors.accentHover,
      light: colors.accentLight,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.inkSecondary,
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.bg,
      paper: colors.surface,
    },
    text: {
      primary: colors.ink,
      secondary: colors.inkSecondary,
      disabled: colors.inkTertiary,
    },
    divider: colors.border,
    success: {
      main: colors.success,
      light: colors.successBg,
    },
    warning: {
      main: colors.warning,
      light: colors.warningBg,
    },
    error: {
      main: colors.error,
      light: colors.errorBg,
    },
    info: {
      main: colors.info,
      light: colors.infoBg,
    },
  },
  typography: {
    fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
      letterSpacing: '-0.025em',
      color: colors.ink,
      fontSize: '2.25rem',
      lineHeight: 1.25,
    },
    h2: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: colors.ink,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: colors.ink,
      fontSize: '1.35rem',
      lineHeight: 1.35,
    },
    h4: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: colors.ink,
      fontSize: '1.15rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 600,
      color: colors.ink,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 600,
      color: colors.ink,
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: colors.inkSecondary,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.45,
      color: colors.inkSecondary,
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      color: colors.ink,
    },
    body2: {
      fontSize: '0.84375rem',
      lineHeight: 1.55,
      color: colors.inkSecondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.005em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: colors.inkTertiary,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    'none',
    'none',
    '0 2px 8px rgba(23, 22, 28, 0.05)',
    '0 4px 16px rgba(23, 22, 28, 0.08)',
    ...Array(20).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg,
          color: colors.ink,
        },
        'input, table, .tabular-num': {
          fontVariantNumeric: 'tabular-nums',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'all 150ms ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: colors.accent,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: colors.accentHover,
          },
        },
        outlined: {
          borderColor: colors.border,
          color: colors.ink,
          '&:hover': {
            borderColor: colors.accent,
            backgroundColor: colors.accentLight,
          },
        },
        text: {
          color: colors.accent,
          '&:hover': {
            backgroundColor: colors.accentLight,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: colors.border,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: colors.surface,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.inkSecondary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.accent,
            borderWidth: 1.5,
          },
        },
        input: {
          padding: '10px 14px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.borderLight}`,
          padding: '12px 16px',
          fontSize: '0.875rem',
          fontVariantNumeric: 'tabular-nums',
        },
        head: {
          fontWeight: 600,
          color: colors.inkSecondary,
          backgroundColor: colors.surfaceSubtle,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.78125rem',
          height: 26,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 16px rgba(23, 22, 28, 0.08)',
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 8px 30px rgba(23, 22, 28, 0.12)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border,
        },
      },
    },
  },
});

export default theme;
