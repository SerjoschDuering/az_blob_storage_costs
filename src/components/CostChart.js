import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  Chip,
  Divider
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useScenariosContext } from '../contexts/ScenariosContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CostChart = () => {
  const { scenarios, calculatedData, monthRange, updateMonthRange, activeScenarioId } = useScenariosContext();
  const [chartType, setChartType] = useState('line');
  const [dataType, setDataType] = useState('monthly');
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  
  const activeScenario = scenarios.find(s => s.id === activeScenarioId);
  const visibleScenarios = scenarios.filter(s => s.isVisible);
  
  // Reset breakdown view if the active scenario changes or becomes invalid
  useEffect(() => {
    if (!activeScenario || !showCostBreakdown) {
        setShowCostBreakdown(false);
    }
  }, [activeScenarioId, showCostBreakdown, activeScenario]);
  
  const handleChartTypeChange = (_, newType) => {
    if (newType !== null) setChartType(newType);
  };
  
  const handleDataTypeChange = (_, newType) => {
    if (newType !== null) {
       setDataType(newType);
       // Automatically switch off breakdown if changing to cumulative
       if (newType === 'cumulative') {
          setShowCostBreakdown(false);
       }
    }
  };
  
  const handleMonthRangeChange = (event) => {
    updateMonthRange(Number(event.target.value));
  };
  
  const handleBreakdownToggle = (event) => {
     setShowCostBreakdown(event.target.checked);
     // If showing breakdown, ensure chart type is 'bar' and data type is 'monthly'
     if (event.target.checked) {
       setChartType('bar');
       setDataType('monthly');
     }
  };
  
  const getChartData = () => {
    const labels = Array.from({ length: monthRange }, (_, i) => `Month ${i + 1}`);
    
    // --- Cost Breakdown View (for active scenario) ---
    if (showCostBreakdown && activeScenario && calculatedData[activeScenario.id]) {
      const scenarioData = calculatedData[activeScenario.id].monthlyData;
      
      if (!scenarioData) return { labels: [], datasets: [] }; // Should not happen if activeScenario exists

      // Ensure data arrays have correct length matching monthRange
      const trimData = (dataArray) => dataArray?.slice(0, monthRange) || [];

      return {
        labels,
        datasets: [
          {
            label: 'Hot Storage',
            data: trimData(scenarioData.storageHotCosts),
            backgroundColor: 'rgba(255, 99, 132, 0.6)', // Reddish
            stack: 'Storage', // Stack storage types
          },
           {
            label: 'Cool Storage',
            data: trimData(scenarioData.storageCoolCosts),
            backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blueish
            stack: 'Storage',
          },
           {
            label: 'Archive Storage',
            data: trimData(scenarioData.storageArchiveCosts),
            backgroundColor: 'rgba(153, 102, 255, 0.6)', // Purplish
            stack: 'Storage',
          },
           {
            label: 'Read Transactions',
            data: trimData(scenarioData.transactionReadCosts),
            backgroundColor: 'rgba(255, 206, 86, 0.6)', // Yellowish
            stack: 'Transactions', // Stack transaction types
          },
           {
            label: 'Write Transactions',
            data: trimData(scenarioData.transactionWriteCosts),
            backgroundColor: 'rgba(255, 159, 64, 0.6)', // Orangish
            stack: 'Transactions',
          },
          {
            label: 'Outbound Transfer',
            data: trimData(scenarioData.outboundCosts),
            backgroundColor: 'rgba(75, 192, 192, 0.6)', // Tealish
            stack: 'Transfer', // Separate stack
          },
        ],
      };
    } 
    // --- Scenario Comparison View ---
    else {
      const datasets = visibleScenarios.map(scenario => {
        const scenarioData = calculatedData[scenario.id];
        if (!scenarioData) return null;

        const data = dataType === 'cumulative'
          ? scenarioData.cumulativeTotalCosts
          : scenarioData.monthlyData?.totalCosts || []; // Added optional chaining

        return {
          label: scenario.name,
          data: data.slice(0, monthRange), // Ensure data length matches monthRange
          borderColor: scenario.color,
          backgroundColor: `${scenario.color}66`, // Slightly more opaque for area fill
          borderWidth: scenario.id === activeScenarioId ? 3 : 1.5,
          pointRadius: scenario.id === activeScenarioId ? 4 : 2,
          pointHoverRadius: scenario.id === activeScenarioId ? 6 : 4,
          fill: chartType === 'area',
          tension: 0.1, // Smoother lines
        };
      }).filter(Boolean); // Filter out null datasets if data is missing

      return { labels, datasets };
    }
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { // Better tooltips
       mode: 'index',
       intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Cost (€ EUR)' },
         stacked: showCostBreakdown, // Enable stacking only for breakdown view
      },
      x: {
        title: { display: true, text: 'Month' },
         stacked: showCostBreakdown, // Enable stacking only for breakdown view
      },
    },
    plugins: {
      legend: {
        position: 'bottom', // Move legend to bottom
         labels: {
            boxWidth: 12,
            padding: 15,
         }
      },
      title: {
        display: true,
        text: showCostBreakdown && activeScenario
          ? `Cost Breakdown: ${activeScenario.name}`
          : `Storage Costs Comparison (${dataType === 'cumulative' ? 'Cumulative' : 'Monthly'})`,
         font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
             let label = context.dataset.label || '';
             if (label) {
                label += ': ';
             }
             if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
             }
             return label;
          }
        }
      }
    },
  };
  
  const chartData = getChartData();
  const ChartComponent = chartType === 'bar' || showCostBreakdown ? Bar : Line;
  
  return (
    <Card elevation={2} sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%' 
    }}>
      <CardContent sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: 2,
        '&:last-child': { 
          pb: 2 
        }
      }}>
        {/* Chart Header with Options */}
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
            Cost Projection
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="month-range-label">Months</InputLabel>
            <Select
              labelId="month-range-label"
              value={monthRange}
              label="Months"
              onChange={handleMonthRangeChange}
            >
              <MenuItem value={12}>12 Months</MenuItem>
              <MenuItem value={24}>24 Months</MenuItem>
              <MenuItem value={36}>36 Months</MenuItem>
              <MenuItem value={48}>48 Months</MenuItem>
              <MenuItem value={60}>60 Months</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        
        {/* Toggle Options */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={2}
        >
         <ToggleButtonGroup
           value={chartType}
           exclusive
           onChange={handleChartTypeChange}
           aria-label="chart type"
           size="small"
         >
           <ToggleButton value="line" aria-label="line chart">
             Line
           </ToggleButton>
           <ToggleButton value="bar" aria-label="bar chart">
             Bar
           </ToggleButton>
           <ToggleButton value="area" aria-label="area chart">
             Area
           </ToggleButton>
         </ToggleButtonGroup>
          
         <ToggleButtonGroup
           value={dataType}
           exclusive
           onChange={handleDataTypeChange}
           aria-label="data type"
           size="small"
           disabled={showCostBreakdown}
         >
           <ToggleButton value="monthly" aria-label="monthly costs">
             Monthly
           </ToggleButton>
           <ToggleButton value="cumulative" aria-label="cumulative costs">
             Cumulative
           </ToggleButton>
         </ToggleButtonGroup>
          
         <FormControlLabel
           control={
             <Switch 
               checked={showCostBreakdown} 
               onChange={handleBreakdownToggle}
               disabled={!activeScenario || dataType === 'cumulative'} 
             />
           }
           label="Cost Breakdown"
         />
        </Stack>
          
        {/* Active Scenario Chip */}
        {showCostBreakdown && activeScenario && (
           <Stack direction="row" alignItems="center" spacing={1} mb={1}>
             <Typography variant="body2">Showing breakdown for:</Typography>
             <Chip 
               label={activeScenario.name}
               size="small"
               sx={{ 
                 bgcolor: `${activeScenario.color}22`,
                 borderLeft: `3px solid ${activeScenario.color}`, 
                 borderRadius: '4px',
                 px: 1
               }}
             />
           </Stack>
        )}
          
        {/* Chart Container - Flexbox to take remaining height */}
        <Box sx={{ 
          flexGrow: 1, 
          height: { xs: '350px', sm: '450px', md: '100%' }, 
          minHeight: '350px', 
          position: 'relative',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 1,
          p: 1
        }}>
          {visibleScenarios.length === 0 ? (
             <Box sx={{ 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               height: '100%' 
             }}>
               <Typography color="text.secondary">
                 No visible scenarios to display. Create a scenario and make it visible to view the chart.
               </Typography>
             </Box>
          ) : (
             chartType === 'bar' ? (
               <Bar data={getChartData()} options={chartOptions} />
             ) : (
               <Line data={getChartData()} options={chartOptions} />
             )
          )}
        </Box>
          
      </CardContent>
    </Card>
  );
};

export default CostChart; 