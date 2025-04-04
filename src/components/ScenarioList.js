import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Stack,
  Button,
  Collapse, // For expanding edit form
  TextField,
  Slider,
  Grid,
  Tooltip, // For tooltips on icons
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save'; // To indicate saving changes
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // For info tooltips
import { useScenariosContext } from '../contexts/ScenariosContext';
import CostAssumptionsModal from './CostAssumptionsModal';

// Component for individual scenario parameters (reusable)
const ScenarioParametersForm = ({ scenario }) => {
  const { updateScenarioParameter, updateScenario } = useScenariosContext();

  const handleParamChange = (param, value) => {
    updateScenarioParameter(scenario.id, param, value);
  };

  const handleNameChange = (event) => {
     updateScenario(scenario.id, { name: event.target.value });
  };
  
  const handleDescriptionChange = (event) => {
     updateScenario(scenario.id, { description: event.target.value });
  };


  // Check if parameters exist before trying to access them
  const params = scenario.parameters || {};

  return (
     <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)', mt: 1 }}>
       <Grid container spacing={3}>
         {/* Basic Info */}
         <Grid item xs={12}>
            <TextField
              label="Scenario Name"
              value={scenario.name}
              onChange={handleNameChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
             <TextField
              label="Description"
              value={scenario.description}
              onChange={handleDescriptionChange}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              size="small"
            />
         </Grid>

         {/* Usage Parameters */}
         <Grid item xs={12} md={6}>
            <Typography variant="overline" display="block" gutterBottom>Usage</Typography>
            <ParameterSlider
              label="Number of Users"
              paramKey="numUsers"
              value={params.numUsers ?? 10} // Provide default if undefined
              min={10} max={1000} step={10}
              onChange={handleParamChange}
              marks={[{ value: 10, label: '10' }, { value: 100, label: '100' }, { value: 1000, label: '1k' }]}
            />
            <ParameterSlider
              label="New Projects/User/Month"
              paramKey="projectsPerUserPerMonth"
              value={params.projectsPerUserPerMonth ?? 1}
              min={1} max={20} step={1}
              onChange={handleParamChange}
              marks={[{ value: 1, label: '1' }, { value: 10, label: '10' }, { value: 20, label: '20' }]}
            />
             <ParameterSlider
              label="GETs/Object (1st month)"
              tooltip="Number of times each data object is read in its first month"
              paramKey="getsPerImageInFirstMonth" // Keep key for now, maybe rename later
              value={params.getsPerImageInFirstMonth ?? 10}
              min={0} max={50} step={1}
              onChange={handleParamChange}
              marks={[{ value: 0, label: '0' }, { value: 15, label: '15' }, { value: 50, label: '50' }]}
            />
         </Grid>

         {/* Data Parameters */}
         <Grid item xs={12} md={6}>
            <Typography variant="overline" display="block" gutterBottom>Data</Typography>
            <ParameterSlider
              label="Data Objects/Project"
              paramKey="dataObjectsPerProject"
              value={params.dataObjectsPerProject ?? 50}
              min={10} max={500} step={10}
              onChange={handleParamChange}
              marks={[{ value: 10, label: '10' }, { value: 100, label: '100' }, { value: 500, label: '500' }]}
            />
             <ParameterSlider
              label="Avg Object Size (MB)"
              paramKey="avgDataObjectSizeMB"
              value={params.avgDataObjectSizeMB ?? 1.0}
              min={0.1} max={10.0} step={0.1}
              onChange={handleParamChange}
              marks={[{ value: 0.1, label: '0.1' }, { value: 1, label: '1' }, { value: 10, label: '10' }]}
              valueLabelFormat={(value) => `${value.toFixed(1)} MB`}
            />
         </Grid>

          {/* Storage Tiers */}
         <Grid item xs={12}>
             <Typography variant="overline" display="block" gutterBottom sx={{mt:1}}>Storage Tier Duration (Months)</Typography>
             <Grid container spacing={2}>
               <Grid item xs={4}>
                 <TextField
                   label="Hot"
                   type="number"
                   value={params.hotTierMonths ?? 1}
                   onChange={(e) => handleParamChange('hotTierMonths', Number(e.target.value))}
                   fullWidth size="small" variant="outlined"
                   inputProps={{ min: 1, step: 1 }} // Hot must be >= 1
                 />
               </Grid>
               <Grid item xs={4}>
                 <TextField
                   label="Cool"
                   type="number"
                   value={params.coolTierMonths ?? 3}
                   onChange={(e) => handleParamChange('coolTierMonths', Number(e.target.value))}
                   fullWidth size="small" variant="outlined"
                   inputProps={{ min: 0, step: 1 }}
                 />
               </Grid>
               <Grid item xs={4}>
                 <TextField
                   label="Archive"
                   type="number"
                   value={params.archiveTierMonths ?? 8}
                   onChange={(e) => handleParamChange('archiveTierMonths', Number(e.target.value))}
                   fullWidth size="small" variant="outlined"
                   inputProps={{ min: 0, step: 1 }}
                 />
               </Grid>
             </Grid>
         </Grid>

       </Grid>
     </Box>
  );
};

// Helper component for sliders to reduce repetition
const ParameterSlider = ({ label, tooltip, paramKey, value, min, max, step, marks, onChange, valueLabelFormat }) => (
  <Box sx={{ mb: 2 }}>
     <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" gutterBottom sx={{ flexGrow: 1 }}>
          {label}: {valueLabelFormat ? valueLabelFormat(value) : value}
        </Typography>
        {tooltip && (
           <Tooltip title={tooltip} placement="top">
              <InfoOutlinedIcon color="action" sx={{ fontSize: '1rem' }} />
           </Tooltip>
        )}
     </Stack>
    <Slider
      value={typeof value === 'number' ? value : min} // Handle potential undefined value
      onChange={(_, newValue) => onChange(paramKey, newValue)}
      step={step}
      min={min}
      max={max}
      marks={marks}
      valueLabelDisplay="auto"
      size="small"
    />
  </Box>
);


const ScenarioList = () => {
  const {
    scenarios,
    addScenario,
    deleteScenario,
    setActiveScenarioId,
    toggleScenarioVisibility,
    toggleScenarioEdit,
    activeScenarioId,
  } = useScenariosContext();

  // State for cost assumptions modal
  const [costModalOpen, setCostModalOpen] = useState(false);
  
  // Create refs for each scenario item
  const scenarioRefs = useRef({});
  // Reference to the scrollable list container
  const listRef = useRef(null);

  // Scroll to element when a scenario starts editing
  useEffect(() => {
    const editingScenario = scenarios.find(s => s.isEditing);
    if (editingScenario && scenarioRefs.current[editingScenario.id]) {
      setTimeout(() => {
        scenarioRefs.current[editingScenario.id].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100); // Small delay to allow the form to expand
    }
  }, [scenarios]);

  // When a new scenario is added, scroll to it
  useEffect(() => {
    if (scenarios.length > 0) {
      const lastScenario = scenarios[scenarios.length - 1];
      if (lastScenario.isEditing && scenarioRefs.current[lastScenario.id]) {
        setTimeout(() => {
          scenarioRefs.current[lastScenario.id].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [scenarios.length]);

  const handleOpenCostModal = () => {
    setCostModalOpen(true);
  };

  const handleCloseCostModal = () => {
    setCostModalOpen(false);
  };

  const handleToggleEdit = (id) => {
    toggleScenarioEdit(id);
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}> 
      <CardContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        p: 2,
        '&:last-child': { 
          pb: 2 
        }
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Scenarios
        </Typography>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={2}>
          <Button
            variant="contained"
            size="small"
            startIcon={<SettingsIcon sx={{ fontSize: 16 }} />}
            onClick={handleOpenCostModal}
            sx={{ 
              bgcolor: 'grey.700', 
              '&:hover': { bgcolor: 'grey.800' },
              fontSize: '0.75rem',
              py: 0.5,
              px: 1,
              mr: 1
            }}
          >
            Cost Assumptions
          </Button>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={addScenario}
            size="small"
          >
            Add Scenario
          </Button>
        </Stack>

        {scenarios.length === 0 && (
           <Typography color="text.secondary" align="center" sx={{mt: 4}}>
              No scenarios created yet. Click "Add Scenario" to begin.
           </Typography>
        )}

        <List 
          ref={listRef}
          sx={{ 
            overflowY: 'auto', 
            flexGrow: 1,
            maxHeight: 'calc(100% - 80px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        > 
          {scenarios.map((scenario, index) => (
            <React.Fragment key={scenario.id}>
              {index > 0 && <Divider component="li" variant="middle" />}
              <ListItem
                disablePadding
                ref={el => scenarioRefs.current[scenario.id] = el}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', // Stack content and form
                  alignItems: 'stretch', // Stretch items full width
                  borderLeft: activeScenarioId === scenario.id ? `4px solid ${scenario.color}` : 'none',
                  bgcolor: activeScenarioId === scenario.id ? 'action.hover' : 'transparent',
                  pl: activeScenarioId === scenario.id ? 1.5 : 2, // Adjust padding
                  transition: 'background-color 0.2s ease-in-out',
                }}
              >
                {/* Scenario Header (Clickable to set active) */}
                 <Box 
                   sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     py: 1, 
                     cursor: 'pointer', 
                     width: '100%', 
                   }}
                   onClick={() => setActiveScenarioId(scenario.id)}
                 >
                  <Box
                    sx={{
                      width: 16, height: 16, borderRadius: '50%',
                      bgcolor: scenario.isVisible ? scenario.color : 'grey.400',
                      mr: 1.5, flexShrink: 0,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  />
                  <ListItemText
                    primary={
                       <Typography variant="subtitle1" component="span" noWrap>
                          {scenario.name}
                       </Typography>
                    }
                    secondary={
                       <Typography variant="body2" color="text.secondary" noWrap>
                          {scenario.description || 'No description'}
                       </Typography>
                    }
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  {/* Action Buttons */}
                  <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
                    <Tooltip title={scenario.isVisible ? "Hide from Chart" : "Show on Chart"}>
                       <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleScenarioVisibility(scenario.id); }}>
                         {scenario.isVisible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                       </IconButton>
                    </Tooltip>
                    <Tooltip title={scenario.isEditing ? "Finish Editing" : "Edit Parameters"}>
                       <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleToggleEdit(scenario.id); }}>
                         {scenario.isEditing ? <SaveIcon fontSize="small" color="primary"/> : <EditIcon fontSize="small" />}
                       </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Scenario">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteScenario(scenario.id); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* Collapsible Edit Form */}
                <Collapse in={scenario.isEditing} timeout="auto" unmountOnExit>
                  <ScenarioParametersForm scenario={scenario} />
                </Collapse>
              </ListItem>
            </React.Fragment>
          ))}
        </List>

        {/* Cost Assumptions Modal */}
        <CostAssumptionsModal open={costModalOpen} onClose={handleCloseCostModal} />
      </CardContent>
    </Card>
  );
};

export default ScenarioList; 