import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

const DEFAULT_CENTER = [23.0225, 72.5714];

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

function getLocation(emergency) {
  if (emergency?.location?.latitude && emergency?.location?.longitude) {
    return {
      latitude: Number(emergency.location.latitude),
      longitude: Number(emergency.location.longitude),
    };
  }
  return null;
}

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

function LiveMap({ emergencies = [], selectedEmergencyId, showFleet = true, routeAssignment, onSelectEmergency }) {
  const validEmergencies = useMemo(
    () => emergencies.filter((e) => getLocation(e) !== null),
    [emergencies]
  );

  const selectedEmergency =
    validEmergencies.find((e) => e.id === selectedEmergencyId) || validEmergencies[0];

  const selectedLocation = getLocation(selectedEmergency);
  const mapCenter = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : DEFAULT_CENTER;

  const routeCoordinates = routeAssignment?.routeCoordinates || [];

  return (
    <div className="map-wrapper">
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="leaflet-container">
        <MapSizeController />
        {routeCoordinates.length > 1
          ? <RouteBounds coordinates={routeCoordinates} />
          : <MapFocus center={mapCenter} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#B91C1C', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
          />
        )}

        {routeAssignment?.currentLocation && (
          <Marker
            icon={selectedAmbulanceIcon}
            position={[
              Number(routeAssignment.currentLocation.latitude),
              Number(routeAssignment.currentLocation.longitude),
            ]}
            zIndexOffset={800}
          >
            <Popup>
              <strong>{routeAssignment.ambulanceId}</strong><br />
              Assigned nearest ambulance<br />
              Driver: {routeAssignment.driverName}<br />
              ETA: {routeAssignment.eta}
            </Popup>
          </Marker>
        )}

        {validEmergencies
          .filter((_, index) => showFleet || index === 0)
          .map((emergency) => {
            const loc = getLocation(emergency);
            return (
              <Marker
                key={emergency.id}
                icon={ambulanceIcon}
                position={[loc.latitude, loc.longitude]}
                eventHandlers={
                  typeof onSelectEmergency === 'function'
                    ? { click: () => onSelectEmergency(emergency) }
                    : undefined
                }
              >
                <Popup>
                  <strong>{emergency.ambulanceId || emergency.id}</strong><br />
                  Emergency: {emergency.id}<br />
                  Driver: {emergency.driverName || 'Unassigned'}<br />
                  ETA: {emergency.eta || 'N/A'}
                </Popup>
              </Marker>
            );
          })}

        {validEmergencies.map((emergency) => {
          const loc = getLocation(emergency);
          return (
            <CircleMarker
              key={`${emergency.id}-pulse`}
              center={[loc.latitude, loc.longitude]}
              radius={emergency.id === selectedEmergencyId ? 24 : 18}
              eventHandlers={
                typeof onSelectEmergency === 'function'
                  ? { click: () => onSelectEmergency(emergency) }
                  : undefined
              }
              pathOptions={{
                color: emergency.id === selectedEmergencyId ? '#7F1D1D' : '#E53935',
                fillColor: emergency.id === selectedEmergencyId ? '#B91C1C' : '#E53935',
                fillOpacity: emergency.id === selectedEmergencyId ? 0.2 : 0.12,
                weight: emergency.id === selectedEmergencyId ? 3 : 1,
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

export default LiveMap;