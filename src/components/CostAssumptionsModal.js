import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useScenariosContext } from '../contexts/ScenariosContext';
import { DEFAULT_PRICING } from '../utils/costCalculator';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pricing-tabpanel-${index}`}
      aria-labelledby={`pricing-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CostAssumptionsModal = ({ open, onClose }) => {
  const { costAssumptions, updateCostAssumption, resetCostAssumptions } = useScenariosContext();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatValue = (value) => {
    // For pricing values that are very small (like per 10,000 operations)
    if (value < 0.001) {
      return value.toExponential(6);
    }
    return value;
  };

  const handleInputChange = (category, subcategory, value) => {
    const numValue = parseFloat(value);
    
    // Validate numeric input
    if (isNaN(numValue) || numValue < 0) {
      return; // Ignore invalid inputs
    }
    
    updateCostAssumption(category, subcategory, numValue);
  };

  const handleReset = () => {
    if (window.confirm('Reset all pricing to default values?')) {
      resetCostAssumptions();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="cost-assumptions-dialog-title"
    >
      <DialogTitle id="cost-assumptions-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Azure Blob Storage Pricing Assumptions
          <Tooltip title="Reset to defaults">
            <IconButton 
              edge="end" 
              color="primary" 
              onClick={handleReset}
              size="small"
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" paragraph>
          This calculator uses the following pricing model for Azure Blob Storage. You can adjust these values to match your specific pricing plan or to model different scenarios.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="pricing tabs">
            <Tab label="Edit Pricing" />
            <Tab label="Pricing Model Details" />
          </Tabs>
        </Box>

        {/* Edit Pricing Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="40%"><Typography fontWeight="bold">Category</Typography></TableCell>
                  <TableCell width="30%"><Typography fontWeight="bold">Value</Typography></TableCell>
                  <TableCell width="30%"><Typography fontWeight="bold">Unit</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Storage Costs */}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1 }}>
                      Storage Costs
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Hot Tier</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ step: "0.001", min: 0 }}
                      value={costAssumptions.storage.hotTier}
                      onChange={(e) => handleInputChange('storage', 'hotTier', e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">EUR per GB per month</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Cool Tier</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ step: "0.001", min: 0 }}
                      value={costAssumptions.storage.coolTier}
                      onChange={(e) => handleInputChange('storage', 'coolTier', e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">EUR per GB per month</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Archive Tier</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ step: "0.0001", min: 0 }}
                      value={costAssumptions.storage.archiveTier}
                      onChange={(e) => handleInputChange('storage', 'archiveTier', e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">EUR per GB per month</Typography>
                  </TableCell>
                </TableRow>

                {/* Transaction Costs */}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
                      Transaction Costs
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Read (GET) Operations</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={formatValue(costAssumptions.transactions.read * 10000)}
                      onChange={(e) => handleInputChange('transactions', 'read', e.target.value / 10000)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">EUR per 10,000 operations</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Write (PUT/POST) Operations</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={formatValue(costAssumptions.transactions.write * 10000)}
                      onChange={(e) => handleInputChange('transactions', 'write', e.target.value / 10000)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">EUR per 10,000 operations</Typography>
                  </TableCell>
                </TableRow>

                {/* Data Transfer Costs */}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
                      Data Transfer Costs
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Free Limit</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ step: "1", min: 0 }}
                      value={costAssumptions.dataTransfer.freeLimit}
                      onChange={(e) => handleInputChange('dataTransfer', 'freeLimit', e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">GB per month</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Outbound Transfer</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ step: "0.001", min: 0 }}
                      value={costAssumptions.dataTransfer.costPerGB}
                      onChange={(e) => handleInputChange('dataTransfer', 'costPerGB', e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">EUR per GB</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Pricing Details Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle1" gutterBottom>
            Azure Blob Storage Pricing Model Explained
          </Typography>
          
          <Typography variant="body2" paragraph>
            The calculator uses the following pricing components to estimate Azure Blob Storage costs:
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            1. Storage Costs
          </Typography>
          <Typography variant="body2" paragraph>
            Storage costs are calculated based on how much data you store and which tier it's stored in:
            <br />• <strong>Hot Tier:</strong> Optimized for frequently accessed data ({DEFAULT_PRICING.storage.hotTier} EUR per GB/month).
            <br />• <strong>Cool Tier:</strong> Optimized for infrequently accessed data stored for at least 30 days ({DEFAULT_PRICING.storage.coolTier} EUR per GB/month).
            <br />• <strong>Archive Tier:</strong> Lowest cost option for rarely accessed data with flexible latency requirements ({DEFAULT_PRICING.storage.archiveTier} EUR per GB/month).
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            2. Transaction Costs
          </Typography>
          <Typography variant="body2" paragraph>
            Costs associated with reading from and writing to storage:
            <br />• <strong>Read Operations:</strong> GET requests to retrieve data ({DEFAULT_PRICING.transactions.read * 10000} EUR per 10,000 operations).
            <br />• <strong>Write Operations:</strong> PUT/POST requests to store data ({DEFAULT_PRICING.transactions.write * 10000} EUR per 10,000 operations).
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            3. Data Transfer Costs
          </Typography>
          <Typography variant="body2" paragraph>
            Costs for transferring data out of Azure:
            <br />• <strong>Free Tier:</strong> First {DEFAULT_PRICING.dataTransfer.freeLimit} GB per month are free.
            <br />• <strong>Additional Outbound:</strong> Beyond the free tier, costs {DEFAULT_PRICING.dataTransfer.costPerGB} EUR per GB.
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            Retention Model
          </Typography>
          <Typography variant="body2" paragraph>
            The calculator uses a tiered retention model for each project:
            <br />• New projects start in the Hot tier.
            <br />• After the Hot tier duration, they move to the Cool tier.
            <br />• After the Cool tier duration, they move to the Archive tier.
            <br />• After all tiers, the data is assumed to be deleted.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <em>Note: This model simplifies some aspects of Azure pricing. For precise estimates or specialized scenarios, please refer to the <a href="https://azure.microsoft.com/en-us/pricing/details/storage/blobs/" target="_blank" rel="noopener noreferrer">official Azure pricing calculator</a>.</em>
          </Typography>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostAssumptionsModal; 