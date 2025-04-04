import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0078d4', // Azure blue
    },
    secondary: {
      main: '#50e6ff', // Azure light blue
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme; 