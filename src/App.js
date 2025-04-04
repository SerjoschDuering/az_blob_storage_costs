import React from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import theme from './styles/theme';
import CostChart from './components/CostChart';
import ScenarioList from './components/ScenarioList';
import { ScenariosProvider } from './contexts/ScenariosContext';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScenariosProvider>
        <Container 
          maxWidth="xl" 
          sx={{ 
            maxHeight: '980px', 
            height: 'calc(100vh - 20px)', 
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            py: 2
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center">
              Azure Blob Storage Cost Calculator
            </Typography>
            <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 2 }}>
              Model and compare Azure Blob Storage costs for different scenarios over time.
            </Typography>
          </Box>
            
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3,
            flexGrow: 1,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              flex: { xs: 1, md: 1, lg: 1 },
              maxWidth: { md: '450px', lg: '500px'},
              minWidth: { md: '400px'},
              height: { md: '100%' },
              display: 'flex'
            }}>
              <ScenarioList />
            </Box>
            <Box sx={{ 
              flex: { xs: 1, md: 2, lg: 3 },
              height: { md: '100%' },
              display: 'flex'
            }}>
              <CostChart />
            </Box>
          </Box>
        </Container>
      </ScenariosProvider>
    </ThemeProvider>
  );
}

export default App; 