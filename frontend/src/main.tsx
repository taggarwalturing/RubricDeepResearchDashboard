import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App'

// Refined Aggregation Metrics Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F7DF3', // Primary Blue for CTAs
      light: '#6B8AFF',
      dark: '#4169E1',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF5722', // Orange-Red for active states
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#3B82F6', // Blue for status/info
      light: '#60A5FA',
      dark: '#2563EB',
    },
    success: {
      main: '#10B981', // Green for positive metrics
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Amber for attention
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Red for negative metrics
      light: '#F87171',
      dark: '#DC2626',
    },
    background: {
      default: '#FFFFFF', // Pure white
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1F36', // Dark Navy for main headings
      secondary: '#64748B', // Medium Gray for subheadings
    },
    divider: '#E2E8F0', // Neutral border
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: '#1A1F36', // Navy
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      color: '#1A1F36', // Navy
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
      color: '#1A1F36', // Navy
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '-0.015em',
      color: '#1A1F36', // Navy
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
      color: '#1A1F36', // Navy
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
      color: '#1A1F36', // Navy
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#374151', // Dark Gray for body text
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748B', // Medium Gray
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#6B7280', // Slate Gray
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.04)',
    '0 1px 3px rgba(0, 0, 0, 0.08)', // Subtle shadow
    '0 2px 4px rgba(0, 0, 0, 0.08)',
    '0 4px 6px rgba(0, 0, 0, 0.08)',
    '0 6px 12px rgba(0, 0, 0, 0.08)',
    '0 8px 16px rgba(0, 0, 0, 0.1)',
    '0 10px 20px rgba(0, 0, 0, 0.1)',
    '0 12px 24px rgba(0, 0, 0, 0.1)',
    '0 14px 28px rgba(0, 0, 0, 0.1)',
    '0 16px 32px rgba(0, 0, 0, 0.12)',
    '0 18px 36px rgba(0, 0, 0, 0.12)',
    '0 20px 40px rgba(0, 0, 0, 0.12)',
    '0 22px 44px rgba(0, 0, 0, 0.12)',
    '0 24px 48px rgba(0, 0, 0, 0.14)',
    '0 26px 52px rgba(0, 0, 0, 0.14)',
    '0 28px 56px rgba(0, 0, 0, 0.14)',
    '0 30px 60px rgba(0, 0, 0, 0.14)',
    '0 32px 64px rgba(0, 0, 0, 0.16)',
    '0 34px 68px rgba(0, 0, 0, 0.16)',
    '0 36px 72px rgba(0, 0, 0, 0.16)',
    '0 38px 76px rgba(0, 0, 0, 0.16)',
    '0 40px 80px rgba(0, 0, 0, 0.18)',
    '0 42px 84px rgba(0, 0, 0, 0.18)',
    '0 44px 88px rgba(0, 0, 0, 0.18)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFFFF',
          '@global': {
            '@font-face': {
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontDisplay: 'swap',
              fontWeight: '300 900',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
          border: '1px solid #E5E7EB',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '10px 20px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(79, 125, 243, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 4px rgba(79, 125, 243, 0.15)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: '#F9FAFB',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
          border: '1px solid #E5E7EB',
        },
        elevation0: {
          boxShadow: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#E5E7EB',
        },
        head: {
          fontWeight: 600,
          color: '#6B7280',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9375rem',
          minHeight: 48,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

