# About
A React + TypeScript dashboard for rural development program budget planning.

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

# Run tests
yarn test

# Run tests with UI
yarn test:ui
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
Vercel has been used for deployment. You can view the live dashboard here: [Program Budget Dashboard](https://budget-sigma-sage.vercel.app/)


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

## Screenshots

<img width="1654" height="961" alt="Screenshot from 2026-03-13 18-54-55" src="https://github.com/user-attachments/assets/46a8e1e3-5182-4daa-a5a5-5676a62e5c6c" />
<img width="1654" height="961" alt="Screenshot from 2026-03-13 18-55-08" src="https://github.com/user-attachments/assets/bc6ad064-b9c0-47f5-8ce1-22e93a4e1472" />
<img width="1654" height="961" alt="Screenshot from 2026-03-13 18-55-18" src="https://github.com/user-attachments/assets/7c556a08-15f3-4832-a7d3-16e4a95e2db9" />
<img width="1654" height="961" alt="Screenshot from 2026-03-13 18-55-25" src="https://github.com/user-attachments/assets/a014f1cd-977d-43a9-b321-c81d130cce6d" />
<img width="1184" height="715" alt="Screenshot from 2026-03-13 18-55-49" src="https://github.com/user-attachments/assets/a1ee51c4-9cd8-43aa-b6b2-4a978e8df4db" />
<img width="1184" height="715" alt="Screenshot from 2026-03-13 18-56-02" src="https://github.com/user-attachments/assets/7579f228-944f-490b-8537-2da592066794" />
<img width="1184" height="715" alt="Screenshot from 2026-03-13 18-56-19" src="https://github.com/user-attachments/assets/7865c681-b5ac-4482-aa36-73f4f9bccc41" />
<img width="1184" height="715" alt="Screenshot from 2026-03-13 18-56-33" src="https://github.com/user-attachments/assets/54229a24-de34-40b9-9fbc-3f48ae0d23df" />
<img width="1184" height="715" alt="Screenshot from 2026-03-13 18-56-45" src="https://github.com/user-attachments/assets/fb41562e-9934-41ec-849b-dda58582b43d" />
<img width="1184" height="715" alt="Screenshot from 2026-03-13 18-56-55" src="https://github.com/user-attachments/assets/7b6e8c6a-4be8-42b3-bf7c-b32af5947028" />

