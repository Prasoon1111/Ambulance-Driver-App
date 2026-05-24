# Backend And Firebase Handoff Guide

This document explains how the frontend is structured today and where the Firebase/API team should plug in authentication, backend data, realtime updates, and integrations with the driver app or other dashboards.

## Product Context

This project is a **super admin dashboard** for the company operating an emergency ambulance coordination platform.

It is not a consumer ambulance booking app. Admin users manage and monitor:

- Hospitals
- Drivers
- Ambulances
- Active emergencies
- Operational activity logs
- Admin settings and roles
- Platform/system health

## Active Source Tree

```text
src/
  components/
    activity/
    ambulances/
    dashboard/
    drivers/
    emergencies/
    hospitals/
    layout/
    ui/
  context/
  firebase/
  layouts/
  pages/
    ActivityLogs/
    Ambulances/
    Dashboard/
    Drivers/
    Emergencies/
    Hospitals/
    Settings/
  routes/
  services/
  styles/
  utils/
```

## File And Folder Purpose

| Path | Purpose |
| --- | --- |
| `src/main.jsx` | React entry point. Wraps the app in `AuthProvider` and `RouterProvider`. |
| `src/routes/AppRoutes.jsx` | Defines public `/login` route and protected `/admin/*` nested routes. |
| `src/routes/ProtectedRoute.jsx` | Blocks admin routes when the user is not authenticated. Replace demo auth check with Firebase Auth state later. |
| `src/layouts/AdminLayout.jsx` | Main admin shell. Renders sidebar, topbar, and nested page outlet. Also wraps admin pages in `OpsProvider`. |
| `src/context/AuthContext.jsx` | Current demo authentication using `sessionStorage`. This is the main file to replace or extend for Firebase Auth. |
| `src/context/OpsContext.jsx` | Current frontend state store for hospitals, drivers, ambulances, emergencies, logs, and settings. This is the current mock-data boundary. |
| `src/firebase/client.js` | Firebase app bootstrap placeholder using `VITE_FIREBASE_*` env variables. |
| `src/services/mockData.js` | Realistic local mock data. Replace reads from here with backend/Firebase reads. |
| `src/services/firebaseRepository.js` | Placeholder repository factory. Intended location for Firestore CRUD abstraction. |
| `src/styles/index.css` | Tailwind imports and global browser/UI styles. |
| `src/utils/cn.js` | Small className merge helper. |
| `src/utils/formatters.js` | Date/search formatting helpers used by tables and logs. |

## Component Purpose

| Path | Purpose |
| --- | --- |
| `src/components/layout/Sidebar.jsx` | Admin navigation, active state, desktop collapse, mobile drawer. |
| `src/components/layout/Topbar.jsx` | Search input, notification button, system status, profile dropdown. |
| `src/components/ui/*` | Shared UI primitives: button, input, select, card, modal, table, badges, page header, empty/loading states. |
| `src/components/dashboard/*` | Dashboard widgets: overview cards, active emergencies, activity feed, system health, ambulance monitoring. |
| `src/components/hospitals/*` | Hospital form and table. |
| `src/components/drivers/*` | Driver form and table. |
| `src/components/ambulances/*` | Ambulance form and table. |
| `src/components/emergencies/*` | Active emergency card layout. |
| `src/components/activity/*` | Activity log table. |

## Page Purpose

| Path | Purpose |
| --- | --- |
| `src/pages/Login.jsx` | Demo login screen. Later should call Firebase Auth. |
| `src/pages/Dashboard/Dashboard.jsx` | Operational overview using dashboard widgets. |
| `src/pages/Hospitals/Hospitals.jsx` | Hospital list, search/filter, add/edit/delete modal flow. |
| `src/pages/Drivers/Drivers.jsx` | Driver list, search/filter, add/edit/delete modal flow. |
| `src/pages/Ambulances/Ambulances.jsx` | Fleet list, GPS status, search/filter, add/edit/delete modal flow. |
| `src/pages/Emergencies/Emergencies.jsx` | Active emergencies realtime-ready view. |
| `src/pages/ActivityLogs/ActivityLogs.jsx` | Operational/audit log table with search/filter. |
| `src/pages/Settings/Settings.jsx` | Admin profile and platform preferences. |

## Current Data Flow

Today the data flow is fully local:

```text
mockData.js
  -> OpsContext.jsx
    -> pages
      -> feature components
        -> ui components
```

CRUD actions currently update React state only:

```text
hospitalsActions.add/update/remove
driversActions.add/update/remove
ambulancesActions.add/update/remove
```

These actions are intentionally shaped like backend calls so the UI can remain mostly unchanged when Firestore/API integration is added.

## Firebase Auth Integration Plan

Install Firebase:

```bash
npm install firebase
```

Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Recommended auth files:

```text
src/services/authService.js
src/context/AuthContext.jsx
```

Suggested `authService.js` responsibilities:

```js
signIn(email, password)
signOut()
onAuthChange(callback)
getCurrentUser()
getIdToken()
```

`AuthContext.jsx` should later expose:

```js
{
  user,
  isAuthenticated,
  isLoading,
  login(email, password),
  logout(),
  claims,
  role
}
```

`ProtectedRoute.jsx` should check:

```text
isLoading -> show loading state
!isAuthenticated -> redirect to /login
authenticated -> render Outlet
```

For role-based access, use Firebase custom claims or a `users/{uid}` profile document.

## Recommended Firestore Collections

These names align with current frontend entities:

```text
users
roles
hospitals
drivers
ambulances
emergencies
assignments
activityLogs
systemHealth
settings
```

Suggested relationships:

```text
drivers.assignedAmbulanceId -> ambulances/{id}
drivers.assignedHospitalId -> hospitals/{id}
ambulances.assignedHospitalId -> hospitals/{id}
ambulances.assignedDriverId -> drivers/{id}
emergencies.assignedAmbulanceId -> ambulances/{id}
emergencies.destinationHospitalId -> hospitals/{id}
assignments.emergencyId -> emergencies/{id}
assignments.driverId -> drivers/{id}
assignments.ambulanceId -> ambulances/{id}
```

Use stable IDs from backend/Firebase, not display names, for relationships. The frontend currently displays names for readability, but backend integration should normalize around IDs.

## API/Firestore Service Layer Plan

Add service files like:

```text
src/services/hospitalService.js
src/services/driverService.js
src/services/ambulanceService.js
src/services/emergencyService.js
src/services/activityLogService.js
src/services/systemHealthService.js
```

Each service should expose predictable methods:

```js
list()
subscribe(callback)
create(payload)
update(id, payload)
remove(id)
```

Then update `OpsContext.jsx` to call services instead of `mockData.js`.

Recommended migration order:

1. Keep current UI unchanged.
2. Add service files.
3. Replace `useState(initialMockData)` with `useEffect` fetch/subscription calls.
4. Replace local CRUD actions with async service calls.
5. Add loading/error states to `OpsContext.jsx`.
6. Keep all page/component props the same.

## Realtime Integration Points

Realtime updates should be added in `OpsContext.jsx`, not inside individual table components.

Good candidates for Firestore `onSnapshot` or WebSocket subscriptions:

```text
emergencies
ambulances
drivers
activityLogs
systemHealth
```

Example data flow later:

```text
Firestore/WebSocket subscription
  -> OpsContext state
    -> Dashboard/Emergencies/Ambulances pages automatically re-render
```

## Backend API Alternative

If using REST or GraphQL instead of direct Firestore from the client, keep the same service layer.

Example:

```text
src/services/httpClient.js
src/services/hospitalService.js
src/services/driverService.js
```

`httpClient.js` should attach Firebase ID token:

```text
Authorization: Bearer <firebase-id-token>
```

The backend should verify that token using Firebase Admin SDK.

## Driver App Integration Notes

The admin dashboard and driver app should share backend entities, especially:

```text
drivers
ambulances
emergencies
assignments
activityLogs
```

Driver app should primarily consume:

```text
current driver profile
assigned ambulance
active assignment
assigned emergency
route/ETA/status updates
hospital destination
```

Admin dashboard should manage:

```text
driver registry
ambulance registry
hospital registry
emergency monitoring
manual reassignment/escalation
audit logs
```

Recommended shared status values:

```text
Emergency: Dispatching, En Route, At Scene, Awaiting Handoff, Resolved, Cancelled
Driver: Available, On Call, Dispatched, Break, Offline
Ambulance: Available, En Route, Standby, Maintenance, Offline
GPS: Online, Degraded, Offline
Hospital: Operational, High Load, Limited Intake, Offline
```

## Other Dashboard Integration Notes

If another dashboard exists, avoid duplicating business logic in each frontend. Share data contracts through backend APIs or Firestore rules.

Common shared entities:

```text
organizations/tenants
users
roles
hospitals
drivers
ambulances
emergencies
assignments
activityLogs
```

Use role-based permissions to control what each dashboard can read or mutate.

## Security Checklist

Before production:

- Replace demo `sessionStorage` auth with Firebase Auth.
- Add role checks in `ProtectedRoute.jsx`.
- Enforce Firestore Security Rules or backend authorization.
- Do not trust frontend role values alone.
- Log admin mutations to `activityLogs`.
- Use stable backend IDs for relationships.
- Validate all create/update payloads server-side or via Firestore rules.
- Protect destructive actions with backend authorization.
- Add environment-specific Firebase projects.

## What Frontend Team Should Avoid Changing During Backend Work

Try to keep these component APIs stable:

```text
DataTable columns/rows props
StatusBadge status prop
Modal open/onClose/footer props
HospitalForm value/onChange props
DriverForm value/onChange props
AmbulanceForm value/onChange props
```

The backend team should mostly work in:

```text
src/context/AuthContext.jsx
src/context/OpsContext.jsx
src/firebase/client.js
src/services/*
src/routes/ProtectedRoute.jsx
```

That keeps the UI components clean and prevents backend logic from leaking into presentational components.

