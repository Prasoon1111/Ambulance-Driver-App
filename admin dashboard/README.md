# ResQOps Super Admin Dashboard

Production-ready React frontend for a real-time Emergency Ambulance Coordination SaaS Platform.

This is the company-owned **super admin panel**, not a public ambulance booking app. It is designed for operations teams to manage hospitals, drivers, ambulances, active emergencies, activity logs, settings, and platform health.

## Tech Stack

- React.js
- Vite
- Tailwind CSS
- shadcn/ui-inspired local primitives
- React Router DOM
- Context API for current frontend state
- Firebase SDK integration-ready structure
- Lucide React icons

## Run Locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

The app opens at `/login`. Demo login is local only; click **Enter Dashboard** to access the admin routes.

## Current Routes

```text
/login
/admin/dashboard
/admin/hospitals
/admin/drivers
/admin/ambulances
/admin/emergencies
/admin/activity-logs
/admin/settings
```

## Important Files

```text
src/main.jsx                         App entry point
src/routes/AppRoutes.jsx             Route tree and nested admin routes
src/routes/ProtectedRoute.jsx        Auth guard for admin routes
src/context/AuthContext.jsx          Current demo auth state
src/context/OpsContext.jsx           Current frontend data/state layer
src/layouts/AdminLayout.jsx          Admin shell with sidebar/topbar/outlet
src/firebase/client.js               Firebase app bootstrap placeholder
src/services/mockData.js             Current local mock data
src/services/firebaseRepository.js   Placeholder repository adapter
```

## Documentation For Backend And Firebase Team

Read this file before integrating backend services:

```text
docs/BACKEND_FIREBASE_HANDOFF.md
```

It explains every active folder, current mock boundaries, planned collections, Firebase Auth wiring, API service structure, and integration points for the driver app and other dashboards.

## Build

```bash
npm run build
```

