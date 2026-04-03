# Finance Management System

An Enterprise-Grade, Modular Finance Management System built with the MERN stack (MongoDB, Express, React, Node.js). This application is designed specifically for organizations, educational institutions, or training centers to manage accounting, multi-role workflows, taxation compliance, and financial reporting.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS v4, React Router, Axios, Lucide React.
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT Auth, Morgan (Logging), Rate Limiting.

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Database Setup
Ensure you have a MongoDB instance running. The application handles seeding the initial Chart of Accounts (COA) automatically on first boot.

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file inside the `server/` directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=90d
FRONTEND_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Start the Vite development server:
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 🏛 Architecture & Data Flow

The app follows a strict **Model-View-Controller (MVC) API Pattern** combined with a **Component-Based UI Architecture**:

1. **Client (React):** Manages global state (System Settings) via React Context. UI communicates through Axios interceptors configured with Bearer tokens for authenticated API requests.
2. **Server (Express):** Receives requests, passes them through global middlewares (Rate Limiter, Helmet, CORS, Data Sanitization). Then hits feature-specific routers (e.g., `/api/incomes`).
3. **Database (MongoDB):** Uses Mongoose models with validation rules. Every financial transaction logs the `createdBy` identity, `status`, and `approval` object.

**Transaction Flow:**
Receptionist creates an Income Entry (Status: PENDING) -> Approver logs in, reviews, and approves it (Status: APPROVED) -> Upon approval, a background Posting Service automatically generates double-entry journals in the Ledger based on the Chart of Accounts.

---

## 🔐 Admin & Registration Logic

The system utilizes a strict Role-Based Access Control (RBAC) model: `SUPERADMIN`, `APPROVER`, `RECEPTIONIST`, `AUDITOR`, and `STUDENT`.

### What if there is no Admin? (Bootstrap Engine)
The API contains an intelligent bootstrap protection mechanism. 
- If the `User` collection has **0 documents mapped to the SUPERADMIN role**, the API enforces that the **very first user registered** must be given the `SUPERADMIN` role. 
- Once the first `SUPERADMIN` is created, the backdoor closes. Any subsequent unprotected attempt to register a Superadmin will be rejected.

### Managing the System with 1 Admin
- The primary Admin logs in and navigates to **Staff Management**. 
- They can create secondary staff roles (e.g., an `APPROVER` to verify expenses, or a `RECEPTIONIST` to capture frontend tuition payments).
- Only Superadmins can change System Settings (Financial Years, Currency, Tax Rates) and the Chart of Accounts structure.

---

## 📊 Modules & Reports Explained

### Core Financial Module
- **Chart of Accounts (COA):** The backbone classification system (Assets, Liabilities, Equity, Income, Expenses).
- **Daily Cashbook:** Tracks immediate liquidity. Shows all Cash & Bank inflows and outflows within a specific date.
- **Ledger:** Shows double-entry line items filtered down to a specific GL (General Ledger) account (e.g., "Electricity Expense").
- **Trial Balance:** Lists the closing balances of all ledger accounts at a specific time. Dr must equal Cr.
- **Income Statement & Balance Sheet:** Standard high-level financial health summaries.

### Taxation & Compliance Module (IRD Compatible)
Built to comply with strict localized tax regulations (e.g., Nepal IRD norms):
- **Purchase Register (Khariid Khaataa):** Logs all internal company purchases with details on VAT inputs and Vendor PAN numbers.
- **Sales Register (Bikrii Khaataa):** Logs all client/student incomes breaking down taxable amounts, exempted amounts, and collected VAT.
- **Annex 13:** A specialized regulatory format detailing sales/incomes exceeding critical thresholds (e.g., 100,000 NPR) alongside the Buyer's PAN for tax auditing.
- **TDS Reports:** Tracks Tax Deducted at Source on expenses (like salaries or professional fees) for clean tax remissions.
