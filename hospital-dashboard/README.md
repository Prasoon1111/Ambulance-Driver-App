# Hospital Emergency Coordination Dashboard

Production-style React + Vite frontend for a futuristic hospital emergency command center. The app is fully mock-driven today and prepared for future Firebase Authentication, Firestore, real-time GPS streaming, and driver emergency synchronization.

## Run

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
```

## Confirmed GPS Contract

All mock data, emergency cards, details pages, tracking panels, and map markers use the backend/maps team structure:

```js
location: {
  latitude: number,
  longitude: number
}
```

## Routes

```text
/             Login
/dashboard    Dashboard
/emergencies  Active emergencies
/tracking     Live tracking
/emergency/:id Emergency details
```

## Structure

```text
src/
 |-- components/
 |-- pages/
 |-- layouts/
 |-- routes/
 |-- firebase/
 |-- services/
 |-- hooks/
 |-- utils/
 |-- mock/
 |-- styles/
 `-- assets/
```

## Integration Notes

- `src/firebase/config.js` is a placeholder for future Firebase project setup.
- `src/services/authService.js` is ready for Firebase Authentication replacement.
- `src/services/emergencyService.js` documents where Firestore `onSnapshot` listeners should connect.
- `src/mock/emergencies.js` contains mock emergency data with `location.latitude` and `location.longitude`.
- `src/components/LiveMap.jsx` simulates live GPS movement with intervals until Firestore GPS streaming is connected.
