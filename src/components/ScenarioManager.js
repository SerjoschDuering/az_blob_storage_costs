import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Slider,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { useScenariosContext } from '../contexts/ScenariosContext';

const ScenarioManager = () => {
  const { addScenario } = useScenariosContext();
  
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [parameters, setParameters] = useState({
    numUsers: 100,
    projectsPerUserPerMonth: 4,
    imagesPerProject: 100,
    thumbnailSizeMB: 0.1,
    mediumSizeMB: 0.8,
    hdSizeMB: 2.5,
    hdImagesPerProject: 10,
    getsPerImageInFirstMonth: 15,
    hotTierMonths: 1,
    coolTierMonths: 3,
    archiveTierMonths: 9
  });
  
  const handleParameterChange = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!scenarioName.trim()) {
      alert('Please provide a scenario name');
      return;
    }
    
    addScenario({
      name: scenarioName,
      description: scenarioDescription,
      parameters,
    });
    
    // Reset form
    setScenarioName('');
    setScenarioDescription('');
    setParameters({
      numUsers: 100,
      projectsPerUserPerMonth: 4,
      imagesPerProject: 100,
      thumbnailSizeMB: 0.1,
      mediumSizeMB: 0.8,
      hdSizeMB: 2.5,
      hdImagesPerProject: 10,
      getsPerImageInFirstMonth: 15,
      hotTierMonths: 1,
      coolTierMonths: 3,
      archiveTierMonths: 9
    });
  };
  
  return (
    <Card elevation={3} sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Create New Scenario
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <TextField
                label="Scenario Name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                label="Description"
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            
            {/* User & Project Parameters */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Users & Projects
              </Typography>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  Number of Users: {parameters.numUsers}
                </Typography>
                <Slider
                  value={parameters.numUsers}
                  onChange={(_, value) => handleParameterChange('numUsers', value)}
                  step={10}
                  min={10}
                  max={1000}
                  marks={[
                    { value: 10, label: '10' },
                    { value: 100, label: '100' },
                    { value: 500, label: '500' },
                    { value: 1000, label: '1000' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  Projects per User per Month: {parameters.projectsPerUserPerMonth}
                </Typography>
                <Slider
                  value={parameters.projectsPerUserPerMonth}
                  onChange={(_, value) => handleParameterChange('projectsPerUserPerMonth', value)}
                  step={1}
                  min={1}
                  max={10}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  Images per Project: {parameters.imagesPerProject}
                </Typography>
                <Slider
                  value={parameters.imagesPerProject}
                  onChange={(_, value) => handleParameterChange('imagesPerProject', value)}
                  step={10}
                  min={10}
                  max={500}
                  marks={[
                    { value: 10, label: '10' },
                    { value: 100, label: '100' },
                    { value: 500, label: '500' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  GET Operations per Image in First Month: {parameters.getsPerImageInFirstMonth}
                </Typography>
                <Slider
                  value={parameters.getsPerImageInFirstMonth}
                  onChange={(_, value) => handleParameterChange('getsPerImageInFirstMonth', value)}
                  step={1}
                  min={1}
                  max={50}
                  marks={[
                    { value: 5, label: '5' },
                    { value: 15, label: '15' },
                    { value: 50, label: '50' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
            
            {/* Image Size & Storage Parameters */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Images & Storage
              </Typography>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  Thumbnail Size (MB): {parameters.thumbnailSizeMB}
                </Typography>
                <Slider
                  value={parameters.thumbnailSizeMB}
                  onChange={(_, value) => handleParameterChange('thumbnailSizeMB', value)}
                  step={0.1}
                  min={0.1}
                  max={1.0}
                  marks={[
                    { value: 0.1, label: '0.1' },
                    { value: 0.5, label: '0.5' },
                    { value: 1.0, label: '1.0' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  Medium Image Size (MB): {parameters.mediumSizeMB}
                </Typography>
                <Slider
                  value={parameters.mediumSizeMB}
                  onChange={(_, value) => handleParameterChange('mediumSizeMB', value)}
                  step={0.1}
                  min={0.1}
                  max={2.0}
                  marks={[
                    { value: 0.5, label: '0.5' },
                    { value: 1.0, label: '1.0' },
                    { value: 2.0, label: '2.0' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  HD Image Size (MB): {parameters.hdSizeMB}
                </Typography>
                <Slider
                  value={parameters.hdSizeMB}
                  onChange={(_, value) => handleParameterChange('hdSizeMB', value)}
                  step={0.5}
                  min={1.0}
                  max={10.0}
                  marks={[
                    { value: 1.0, label: '1.0' },
                    { value: 5.0, label: '5.0' },
                    { value: 10.0, label: '10.0' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  HD Images per Project: {parameters.hdImagesPerProject}
                </Typography>
                <Slider
                  value={parameters.hdImagesPerProject}
                  onChange={(_, value) => handleParameterChange('hdImagesPerProject', value)}
                  step={1}
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 10, label: '10' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box className="parameter-form-group">
                <Typography gutterBottom>
                  Storage Tiers (months)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Hot"
                      type="number"
                      value={parameters.hotTierMonths}
                      onChange={(e) => handleParameterChange('hotTierMonths', Number(e.target.value))}
                      fullWidth
                      inputProps={{ min: 1, max: 12 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Cool"
                      type="number"
                      value={parameters.coolTierMonths}
                      onChange={(e) => handleParameterChange('coolTierMonths', Number(e.target.value))}
                      fullWidth
                      inputProps={{ min: 0, max: 12 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Archive"
                      type="number"
                      value={parameters.archiveTierMonths}
                      onChange={(e) => handleParameterChange('archiveTierMonths', Number(e.target.value))}
                      fullWidth
                      inputProps={{ min: 0, max: 12 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button type="submit" variant="contained" color="primary" size="large">
              Create Scenario
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScenarioManager; 