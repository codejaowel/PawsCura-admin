import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons under Vite bundling
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER = [14.5995, 120.9842]; // Manila

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Re-center the map when coordinates are typed in manually
function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position?.[0], position?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapPicker({ latitude, longitude, onChange }) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng);
  const position = hasPin ? [lat, lng] : null;

  const handlePick = (newLat, newLng) => {
    onChange(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
  };

  return (
    <div className="map-picker">
      <MapContainer
        center={position || DEFAULT_CENTER}
        zoom={hasPin ? 16 : 12}
        scrollWheelZoom
        style={{ height: '260px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={handlePick} />
        <Recenter position={position} />
        {position && (
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                handlePick(p.lat, p.lng);
              },
            }}
          />
        )}
      </MapContainer>
      <p className="map-picker-hint">
        {hasPin
          ? 'Drag the pin to adjust the clinic location, or click elsewhere to move it.'
          : 'Click on the map to pin the clinic location.'}
      </p>
    </div>
  );
}
