// Azure Blob Storage pricing constants (in EUR)
export const DEFAULT_PRICING = {
  storage: {
    hotTier: 0.02, // EUR per GB per month
    coolTier: 0.012, // EUR per GB per month
    archiveTier: 0.001, // EUR per GB per month
  },
  transactions: {
    write: 0.05 / 10000, // EUR per 10,000 operations (using Hot tier cost)
    read: 0.004 / 10000, // EUR per 10,000 operations (using Hot tier cost)
  },
  dataTransfer: {
    freeLimit: 100, // GB per month
    costPerGB: 0.087, // EUR per GB
  },
};

/**
 * Calculate Azure Blob Storage costs based on scenario parameters
 * @param {Object} params - Scenario parameters
 * @param {number} monthsToCalculate - Number of months to calculate costs for
 * @param {Object} pricing - Optional custom pricing model (defaults to DEFAULT_PRICING)
 * @returns {Object} Monthly costs and aggregated costs
 */
export const calculateCosts = (params, monthsToCalculate = 24, pricing = DEFAULT_PRICING) => {
  // --- Input Validation ---
  if (!params) {
    console.error("calculateCosts called with invalid parameters:", params);
    // Return default empty structure to prevent crashes downstream
    return { 
      monthlyCosts: [], 
      monthlyData: { storageCosts: [], transactionCosts: [], outboundCosts: [], totalCosts: [] }, 
      cumulativeTotalCosts: [] 
    };
  }
  
  const {
    numUsers = 0, // Default values to prevent NaN errors
    projectsPerUserPerMonth = 0,
    // --- Simplified Parameters ---
    dataObjectsPerProject = 0,
    avgDataObjectSizeMB = 0,
    // ---------------------------
    getsPerImageInFirstMonth = 0, // Consider renaming this parameter
    hotTierMonths = 1,
    coolTierMonths = 3,
    archiveTierMonths = 9, // Use the value from params
  } = params;
  
  // Ensure tier months are non-negative integers
  const validHotTierMonths = Math.max(1, Math.floor(hotTierMonths)); // Hot must be at least 1
  const validCoolTierMonths = Math.max(0, Math.floor(coolTierMonths));
  const validArchiveTierMonths = Math.max(0, Math.floor(archiveTierMonths));


  // --- Calculations based on Simplified Parameters ---
  const projectSizeGB = (dataObjectsPerProject * avgDataObjectSizeMB) / 1024;
  
  // Calculate GET operations for a single project in its first month
  // Note: 'getsPerImageInFirstMonth' needs context adjustment if it's per *object* now
  const getOperationsPerProject = dataObjectsPerProject * getsPerImageInFirstMonth;
  
  // Outbound assumes each GET operation transfers one average-sized object
  const outboundGBPerProject = (getOperationsPerProject * avgDataObjectSizeMB) / 1024;
  // -----------------------------------------------------

  const monthlyCosts = [];
  const monthlyData = {
    storageCosts: [],
    transactionCosts: [],
    outboundCosts: [],
    totalCosts: [],
    // Detailed breakdown for potential future use or debugging
    storageHotCosts: [],
    storageCoolCosts: [],
    storageArchiveCosts: [],
    transactionReadCosts: [],
    transactionWriteCosts: [],
  };
  
  let cumulativeProjectData = []; // Tracks { monthAdded, projectCount }

  for (let month = 1; month <= monthsToCalculate; month++) {
    // --- Monthly Activity ---
    const newProjectsThisMonth = numUsers * projectsPerUserPerMonth;
    if (newProjectsThisMonth > 0) {
       cumulativeProjectData.push({ monthAdded: month, projectCount: newProjectsThisMonth });
    }
    
    // --- Tier Distribution ---
    let hotTierGB = 0;
    let coolTierGB = 0;
    let archiveTierGB = 0;

    cumulativeProjectData.forEach(batch => {
      const ageInMonths = month - batch.monthAdded + 1;
      const batchSizeGB = batch.projectCount * projectSizeGB;

      if (ageInMonths <= validHotTierMonths) {
        hotTierGB += batchSizeGB;
      } else if (ageInMonths <= validHotTierMonths + validCoolTierMonths) {
        coolTierGB += batchSizeGB;
      } else if (ageInMonths <= validHotTierMonths + validCoolTierMonths + validArchiveTierMonths) {
        archiveTierGB += batchSizeGB;
      }
      // Projects older than retention period are implicitly ignored (zero cost)
    });

    // --- Cost Calculations ---
    
    // Storage Costs - Use the provided pricing
    const hotTierStorageCost = hotTierGB * pricing.storage.hotTier;
    const coolTierStorageCost = coolTierGB * pricing.storage.coolTier;
    const archiveTierStorageCost = archiveTierGB * pricing.storage.archiveTier;
    const totalStorageCost = hotTierStorageCost + coolTierStorageCost + archiveTierStorageCost;
    
    // Transaction Costs (for NEW projects this month)
    // Assume reads happen only in the first (Hot) month for new projects
    const getOperations = newProjectsThisMonth * getOperationsPerProject;
    const getTransactionCost = getOperations * pricing.transactions.read; // Using simplified rate
    
    // Assume writes happen when projects are created (Hot tier)
    // Estimate: 1 write per data object + 1 for metadata/project setup? Adjust as needed.
    const writeOperations = newProjectsThisMonth * (dataObjectsPerProject + 1); 
    const writeTransactionCost = writeOperations * pricing.transactions.write; // Using simplified rate
    
    const totalTransactionCost = getTransactionCost + writeTransactionCost;
    
    // Outbound Data Costs (for NEW projects this month)
    const outboundGB = newProjectsThisMonth * outboundGBPerProject;
    const billableOutboundGB = Math.max(0, outboundGB - pricing.dataTransfer.freeLimit);
    const outboundCost = billableOutboundGB * pricing.dataTransfer.costPerGB;
    
    // Total Cost for the Month
    const totalMonthCost = totalStorageCost + totalTransactionCost + outboundCost;
    
    // --- Store Monthly Results ---
    monthlyData.storageCosts.push(totalStorageCost);
    monthlyData.transactionCosts.push(totalTransactionCost);
    monthlyData.outboundCosts.push(outboundCost);
    monthlyData.totalCosts.push(totalMonthCost);
    // Store breakdown
    monthlyData.storageHotCosts.push(hotTierStorageCost);
    monthlyData.storageCoolCosts.push(coolTierStorageCost);
    monthlyData.storageArchiveCosts.push(archiveTierStorageCost);
    monthlyData.transactionReadCosts.push(getTransactionCost);
    monthlyData.transactionWriteCosts.push(writeTransactionCost);

    // Optional: Detailed monthly breakdown (can be large)
    monthlyCosts.push({
      month,
      storage: { hot: hotTierStorageCost, cool: coolTierStorageCost, archive: archiveTierStorageCost, total: totalStorageCost },
      transactions: { read: getTransactionCost, write: writeTransactionCost, total: totalTransactionCost },
      outbound: { totalGB: outboundGB, cost: outboundCost },
      totalCost: totalMonthCost,
    });
  }
  
  // Calculate Cumulative Costs
  const cumulativeTotalCosts = monthlyData.totalCosts.reduce((acc, cost) => {
    const lastTotal = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(lastTotal + cost);
    return acc;
  }, []);
  
  return {
    monthlyCosts, // Detailed breakdown per month (optional)
    monthlyData,  // Aggregated data arrays for charting
    cumulativeTotalCosts,
  };
}; 