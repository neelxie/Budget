# Program Budget & Allocation Dashboard

A React + TypeScript dashboard for rural development program budget planning.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** 
- **Tailwind CSS v4** 
- **Recharts** (charts)
- **Lucide React** (icons)
- **localStorage** 

## Features

- Budget allocation table with sort, filter, search, pagination
- Add / Edit / Delete allocations
- Auto-computed summary cards (clusters, villages, beneficiaries, budgets)
- 4 charts: Budget by Cluster, Budget Distribution, Beneficiaries, Efficiency
- CSV export
- Dark mode (persisted)
- Data persisted in localStorage
- Loading skeletons & error handling
- Fully responsive

## Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Folder Structure

```
src/
├── components/
│   ├── AllocationForm/   
│   ├── BudgetTable/     
│   ├── SummaryCards/     
│   ├── Charts/           
│   └── UI/               
├── pages/Dashboard/     
├── services/
│   └── allocationService.ts  # Mock API (GET/POST/PATCH/DELETE)
├── hooks/
│   └── useAllocations.ts     
├── types/
│   └── allocation.ts         
├── utils/
│   └── calculations.ts       
└── context/
    └── ThemeContext.tsx       # Dark mode
```

## Mock API Endpoints (simulated)

| Method | Endpoint         | Description           |
| ------ | ---------------- | --------------------- |
| GET    | /allocations     | Fetch all allocations |
| POST   | /allocations     | Create new allocation |
| PATCH  | /allocations/:id | Update allocation     |
| DELETE | /allocations/:id | Delete allocation     |

All data is persisted to `localStorage` under the key `budget_allocations`.  
On first load, 8 seed records are loaded automatically.

## Deployment
Vercel has been used for deployment. You can view the live dashboard here: [Program Budget Dashboard](https://program-budget-dashboard.vercel.app/)


## Resetting Data

To reset to seed data, open the browser console and run:

```js
localStorage.removeItem("budget_allocations");
location.reload();
```

## Charts Explained

| Chart                    | Why it's here                                  |
| ------------------------ | ---------------------------------------------- |
| Budget by Cluster        | Cluster-level Seeds vs Tools comparison        |
| Budget Distribution      | Overall Seeds vs Tools pie split               |
| Beneficiaries by Cluster | Shows program reach, not just spending         |
| Budget Efficiency        | UGX per beneficiary — reveals cost disparities |
