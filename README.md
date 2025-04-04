# Azure Blob Storage Cost Calculator

A simple web application to calculate and visualize Azure Blob Storage costs over time for different usage scenarios.

## Features

- Create multiple usage scenarios with customizable parameters
- Compare costs across different scenarios
- Visualize monthly and cumulative costs over time
- See detailed cost breakdowns by category (storage, transactions, outbound data transfer)
- Save scenarios locally for future reference

## Usage

1. Create a new scenario by entering a name, description, and adjusting the parameters
2. View and compare the cost visualization in the chart
3. Add additional scenarios to compare different usage patterns
4. Toggle between monthly and cumulative cost views
5. Change chart type (line, area, bar) for different visualizations
6. Adjust the time period for longer-term projections

## Parameters

The calculator considers the following parameters:

### User & Project Parameters
- Number of users
- Projects per user per month
- Images per project
- GET operations per image in the first month

### Image Size Parameters
- Thumbnail size (MB)
- Medium image size (MB)
- HD image size (MB)
- Number of HD images per project

### Storage Tier Parameters
- Hot tier storage period (months)
- Cool tier storage period (months)
- Archive tier storage period (months)

## Pricing Model

The calculator uses the following Azure Blob Storage pricing model:

### Storage Costs
- Hot Tier: €0.02 per GB per month
- Cool Tier: €0.012 per GB per month
- Archive Tier: €0.001 per GB per month

### Transaction Costs
- Write Operations (Hot): €0.05 per 10,000 operations
- Write Operations (Cool): €0.10 per 10,000 operations
- Read Operations (Hot): €0.004 per 10,000 operations
- Read Operations (Cool): €0.01 per 10,000 operations

### Data Transfer Costs
- First 100 GB per month: Free
- Beyond 100 GB: €0.087 per GB

## Running the Application

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Technologies Used

- React
- Material UI
- Chart.js
- React Chart.js 2 