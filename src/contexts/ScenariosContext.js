import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calculateCosts, DEFAULT_PRICING } from '../utils/costCalculator';

const ScenariosContext = createContext();

export const useScenariosContext = () => useContext(ScenariosContext);

// Helper to generate distinct colors
const generateColor = (index) => {
  const colors = [
    '#2E7D32', // Emerald Green
    '#C62828', // Deep Red
    '#1565C0', // Royal Blue
    '#6A1B9A', // Purple
    '#F57F17', // Amber
    '#00838F', // Teal
    '#283593', // Indigo
    '#FF6F00', // Orange
    '#AD1457', // Pink
    '#004D40', // Dark Teal
    '#4527A0', // Deep Purple
    '#BF360C', // Deep Orange
    '#0277BD', // Light Blue
    '#558B2F', // Light Green
    '#827717', // Lime
    '#880E4F', // Dark Pink
  ];
  return colors[index % colors.length];
};

export const ScenariosProvider = ({ children }) => {
  // Add state for cost assumptions
  const [costAssumptions, setCostAssumptions] = useState(() => {
    const savedAssumptions = localStorage.getItem('blobCostAssumptions');
    return savedAssumptions ? JSON.parse(savedAssumptions) : DEFAULT_PRICING;
  });

  const [scenarios, setScenarios] = useState(() => {
    const savedScenarios = localStorage.getItem('blobCostScenarios');
    const initialScenarios = savedScenarios ? JSON.parse(savedScenarios) : [
      {
        id: 'default-scenario-1', // Ensure unique ID if multiple defaults
        name: 'Default Scenario',
        description: 'Basic scenario with default parameters',
        parameters: {
          numUsers: 100,
          projectsPerUserPerMonth: 4,
          // --- Simplified Parameters ---
          dataObjectsPerProject: 100, 
          avgDataObjectSizeMB: 0.9, // Approx average based on old params
          // ---------------------------
          getsPerImageInFirstMonth: 15, // Renaming this might be good later
          hotTierMonths: 1,
          coolTierMonths: 3,
          archiveTierMonths: 9,
        },
        // Default state for editing and visibility
        isEditing: false, 
        isVisible: true, 
      }
    ];
    // Ensure all loaded scenarios have default editing/visibility/color states
     return initialScenarios.map((s, index) => ({
      ...s,
      isEditing: s.isEditing === true, // Ensure boolean
      isVisible: s.isVisible !== false, // Default to true if undefined
      color: s.color || generateColor(index), // Assign color if missing
    }));
  });
  
  const [monthRange, setMonthRange] = useState(24);
  const [calculatedData, setCalculatedData] = useState({});
  const [activeScenarioId, setActiveScenarioId] = useState(() => {
     // Set the first scenario as active initially
    return scenarios.length > 0 ? scenarios[0].id : null;
  });

  // Save cost assumptions to localStorage
  useEffect(() => {
    localStorage.setItem('blobCostAssumptions', JSON.stringify(costAssumptions));
  }, [costAssumptions]);

  useEffect(() => {
    localStorage.setItem('blobCostScenarios', JSON.stringify(scenarios));
    
    const newCalculatedData = {};
    scenarios.forEach(scenario => {
       if (scenario.parameters) { // Check if parameters exist
         // Pass costAssumptions to calculator
         newCalculatedData[scenario.id] = calculateCosts(scenario.parameters, monthRange, costAssumptions);
       }
    });
    setCalculatedData(newCalculatedData);
  }, [scenarios, monthRange, costAssumptions]); // Add costAssumptions to dependencies
  
  // --- Scenario Management ---

  const addScenario = () => {
    const newScenario = {
      id: uuidv4(),
      name: `New Scenario ${scenarios.length + 1}`,
      description: '',
      parameters: { // Default parameters for new scenarios
         numUsers: 10,
         projectsPerUserPerMonth: 3,
         dataObjectsPerProject: 50, 
         avgDataObjectSizeMB: 1.0,
         getsPerImageInFirstMonth: 10,
         hotTierMonths: 1,
         coolTierMonths: 3,
         archiveTierMonths: 8, // Example different default
      },
      isEditing: true, // Start in edit mode
      isVisible: true,
      color: generateColor(scenarios.length),
    };
    
    setScenarios(prev => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id); // Make the new one active
  };
  
  const updateScenario = (id, updates) => {
    setScenarios(prev => 
      prev.map(scenario => 
        scenario.id === id ? { ...scenario, ...updates } : scenario
      )
    );
  };

  const updateScenarioParameter = (id, param, value) => {
     setScenarios(prev =>
       prev.map(scenario =>
         scenario.id === id
           ? {
               ...scenario,
               parameters: {
                 ...scenario.parameters,
                 [param]: value,
               },
             }
           : scenario
       )
     );
  };
  
  const deleteScenario = (id) => {
     setScenarios(prev => {
       const remaining = prev.filter(scenario => scenario.id !== id);
       // If the deleted scenario was active, set the first remaining one as active
       if (activeScenarioId === id) {
         setActiveScenarioId(remaining.length > 0 ? remaining[0].id : null);
       }
       return remaining;
     });
  };
  
  const toggleScenarioVisibility = (id) => {
    setScenarios(prev => 
      prev.map(scenario => 
        scenario.id === id 
          ? { ...scenario, isVisible: !scenario.isVisible } 
          : scenario
      )
    );
  };

  const toggleScenarioEdit = (id) => {
     setScenarios(prev =>
       prev.map(scenario =>
         scenario.id === id
           ? { ...scenario, isEditing: !scenario.isEditing }
           : scenario // Optionally close others: { ...scenario, isEditing: false }
       )
     );
  };
  
  // --- Cost Assumptions Management ---
  
  const updateCostAssumption = (category, subcategory, value) => {
    setCostAssumptions(prev => {
      if (subcategory) {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [subcategory]: value
          }
        };
      } else {
        return {
          ...prev,
          [category]: value
        };
      }
    });
  };

  const resetCostAssumptions = () => {
    setCostAssumptions(DEFAULT_PRICING);
  };

  // --- Other ---

  const updateMonthRange = (range) => {
    setMonthRange(range);
  };
  
  const value = {
    scenarios,
    calculatedData,
    monthRange,
    activeScenarioId, // Expose activeScenarioId
    costAssumptions, // Expose cost assumptions
    addScenario,
    updateScenario,
    updateScenarioParameter, // Expose parameter update function
    deleteScenario,
    setActiveScenarioId, // Expose setter for active scenario
    toggleScenarioVisibility,
    toggleScenarioEdit, // Expose edit toggle function
    updateMonthRange,
    updateCostAssumption, // Expose cost assumption update function
    resetCostAssumptions // Expose reset function
  };
  
  return (
    <ScenariosContext.Provider value={value}>
      {children}
    </ScenariosContext.Provider>
  );
}; 