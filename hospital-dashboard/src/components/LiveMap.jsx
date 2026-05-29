import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { hospitalMarker } from '../mock/emergencies';

const ambulanceIcon = L.divIcon({
  className: 'ambulance-marker',
  html: '<span>AMB</span>',
  iconSize: [46, 46],
  iconAnchor: [23, 23],
});

const selectedAmbulanceIcon = L.divIcon({
  className: 'ambulance-marker selected-ambulance-marker',
  html: '<span>AMB</span>',
  iconSize: [54, 54],
  iconAnchor: [27, 27],
});

const hospitalIcon = L.divIcon({
  className: 'hospital-marker',
  html: '<span>H</span>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

function MapFocus({ center }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.2 });
  }, [center, map]);

  return null;
}

function RouteBounds({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length < 2) return;
    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14, animate: true, duration: 1 });
  }, [coordinates, map]);

  return null;
}

function MapSizeController() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false });
    const frame = window.requestAnimationFrame(invalidate);
    const timeout = window.setTimeout(invalidate, 250);
    window.addEventListener('resize', invalidate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);

  return null;
}

function moveEmergency(emergency, tick) {
  const wave = Math.sin((tick + emergency.id.length) / 5) * 0.0012;
  const drift = Math.cos((tick + emergency.ambulanceId.length) / 6) * 0.0012;

  return {
    ...emergency,
    location: {
      latitude: emergency.location.latitude + wave,
      longitude: emergency.location.longitude + drift,
    },
  };
}

function LiveMap({ emergencies = [], selectedEmergencyId, showFleet = true, routeAssignment, onSelectEmergency }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Future live GPS integration:
    // Replace this interval with Firestore onSnapshot updates from driver GPS documents.
    const interval = window.setInterval(() => setTick((current) => current + 1), 1800);
    return () => window.clearInterval(interval);
  }, []);

  const movingEmergencies = useMemo(() => emergencies.map((emergency) => moveEmergency(emergency, tick)), [emergencies, tick]);
  const selectedEmergency = movingEmergencies.find((emergency) => emergency.id === selectedEmergencyId) || movingEmergencies[0];
  const routeCoordinates = routeAssignment?.routeCoordinates || [];
  const mapCenter = selectedEmergency
    ? [selectedEmergency.location.latitude, selectedEmergency.location.longitude]
    : [hospitalMarker.location.latitude, hospitalMarker.location.longitude];

  return (
    <div className="map-wrapper">
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="leaflet-container">
        <MapSizeController />
        {routeCoordinates.length > 1 ? <RouteBounds coordinates={routeCoordinates} /> : <MapFocus center={mapCenter} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[hospitalMarker.location.latitude, hospitalMarker.location.longitude]} icon={hospitalIcon}>
          <Popup>
            <strong>{hospitalMarker.name}</strong>
            <br />
            Hospital ID: {hospitalMarker.id}
          </Popup>
        </Marker>

        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#B91C1C', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
          />
        )}

        {routeAssignment && (
          <Marker
            icon={selectedAmbulanceIcon}
            position={[routeAssignment.currentLocation.latitude, routeAssignment.currentLocation.longitude]}
            zIndexOffset={800}
          >
            <Popup>
              <strong>{routeAssignment.ambulanceId}</strong>
              <br />
              Assigned nearest ambulance
              <br />
              Driver: {routeAssignment.driverName}
              <br />
              ETA: {routeAssignment.eta}
            </Popup>
          </Marker>
        )}

        {movingEmergencies.filter((_, index) => showFleet || index === 0).map((emergency) => (
          <Marker
            key={emergency.id}
            icon={ambulanceIcon}
            position={[emergency.location.latitude, emergency.location.longitude]}
            eventHandlers={
              typeof onSelectEmergency === 'function'
                ? {
                    click: () => onSelectEmergency(emergency),
                  }
                : undefined
            }
          >
            <Popup>
              <strong>{emergency.ambulanceId}</strong>
              <br />
              Emergency: {emergency.id}
              <br />
              Driver: {emergency.driverName}
              <br />
              ETA: {emergency.eta}
            </Popup>
          </Marker>
        ))}

        {movingEmergencies.map((emergency) => (
          <CircleMarker
            key={`${emergency.id}-pulse`}
            center={[emergency.location.latitude, emergency.location.longitude]}
            radius={emergency.id === selectedEmergencyId ? 24 : 18}
            eventHandlers={
              typeof onSelectEmergency === 'function'
                ? {
                    click: () => onSelectEmergency(emergency),
                  }
                : undefined
            }
            pathOptions={{
              color: emergency.id === selectedEmergencyId ? '#7F1D1D' : '#E53935',
              fillColor: emergency.id === selectedEmergencyId ? '#B91C1C' : '#E53935',
              fillOpacity: emergency.id === selectedEmergencyId ? 0.2 : 0.12,
              weight: emergency.id === selectedEmergencyId ? 3 : 1,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default LiveMap;
