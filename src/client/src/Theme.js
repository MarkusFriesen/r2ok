import { createTheme, alpha } from '@mui/material/styles';

export const navy = '#0a2433';

// Frosted "liquid glass" surface: translucent fill, blurred backdrop,
// bright hairline border with a top highlight and a soft wide shadow
export const glass = (opacity = 0.55) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  backgroundImage: 'none',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 10px 40px ${alpha(navy, 0.12)}`,
});

const theme = createTheme({
  palette: {
    primary: {
      main: navy,
    },
    secondary: {
      main: '#ff6b3d',
      contrastText: '#fff',
    },
    success: {
      main: '#2fb67c',
    },
    warning: {
      main: '#f5a623',
    },
    error: {
      main: '#e5484d',
    },
    text: {
      primary: navy,
      secondary: alpha(navy, 0.6),
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: glass(),
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: 24 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: 'background-color 150ms, transform 120ms',
          '&:active': { transform: 'scale(0.98)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          ...glass(0.4),
          boxShadow: 'none',
          borderRadius: 14,
        },
        notchedOutline: {
          borderColor: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { gap: 4 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: 0,
          borderRadius: '999px !important',
          padding: '8px 20px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          color: alpha(navy, 0.65),
          transition: 'background-color 200ms, box-shadow 200ms, color 200ms',
          '&.Mui-selected, &.Mui-selected:hover': {
            color: navy,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            boxShadow: `inset 0 1px 0 #fff, 0 2px 10px ${alpha(navy, 0.15)}`,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: alpha(navy, 0.15),
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          },
        },
        paper: {
          ...glass(0.7),
          borderRadius: 28,
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          border: 0,
          backgroundColor: alpha(navy, 0.75),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#fff',
        },
      },
    },
  },
});

export default theme
