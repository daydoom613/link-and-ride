import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';

interface RideMapProps {
  origin?: string;
  destination?: string;
  originCoords?: [number, number]; // [lng, lat]
  destCoords?: [number, number];   // [lng, lat]
  onLocationSelect?: (location: { address: string; coords: [number, number] }, type: 'origin' | 'destination') => void;
  interactive?: boolean;
  height?: string;
  showEta?: boolean;
}

const defaultCenter: [number, number] = [20.5937, 78.9629]; // India [lat, lng]

const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const latLngs = points.map(p => L.latLng(p[0], p[1]));
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [points, map]);
  return null;
};

const RideMap = ({
  origin,
  destination,
  originCoords,
  destCoords,
  onLocationSelect,
  interactive = false,
  height = '400px'
}: RideMapProps) => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null); // [lat, lng]
  const [clickStep, setClickStep] = useState<'origin' | 'destination'>('origin');
  const [etaText, setEtaText] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPosition([lat, lng]);
      },
      () => {
        // ignore error; stay with default center
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const mapCenter = useMemo<[number, number]>(() => {
    if (userPosition) return userPosition; // [lat, lng]
    return defaultCenter;
  }, [userPosition]);

  const markers: { position: [number, number]; color: string; label: string }[] = [];
  if (originCoords) markers.push({ position: [originCoords[1], originCoords[0]], color: '#22c55e', label: 'Origin' });
  if (destCoords) markers.push({ position: [destCoords[1], destCoords[0]], color: '#ef4444', label: 'Destination' });
  if (!originCoords && !destCoords && userPosition) markers.push({ position: userPosition, color: '#3b82f6', label: 'You' });

  const polyPoints: [number, number][] = originCoords && destCoords
    ? [ [originCoords[1], originCoords[0]], [destCoords[1], destCoords[0]] ]
    : [];

  // Fetch simple OSRM route ETA if both coords exist
  useEffect(() => {
    const fetchEta = async () => {
      if (!originCoords || !destCoords) { setEtaText(null); return; }
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=false&alternatives=false&steps=false`;
        const res = await fetch(url);
        const json = await res.json();
        const route = json?.routes?.[0];
        if (route) {
          const km = (route.distance / 1000).toFixed(1);
          const min = Math.round(route.duration / 60);
          setEtaText(`${km} km • ${min} min`);
        } else {
          setEtaText(null);
        }
      } catch {
        setEtaText(null);
      }
    };
    fetchEta();
  }, [originCoords, destCoords]);

  const handleMapClick = (e: any) => {
    if (!interactive || !onLocationSelect) return;
    const lat = e.latlng.lat as number;
    const lng = e.latlng.lng as number;
    const coordsLngLat: [number, number] = [lng, lat];
    onLocationSelect({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, coords: coordsLngLat }, clickStep);
    setClickStep(clickStep === 'origin' ? 'destination' : 'origin');
  };

  const ClickHandler = () => {
    const map = useMap();
    useEffect(() => {
      if (!interactive) return;
      map.on('click', handleMapClick);
      return () => { map.off('click', handleMapClick); };
    }, [map, interactive, clickStep]);
    return null;
  };

  const icon = (color: string) => L.divIcon({
    className: 'custom-marker',
    html: `<span style="display:inline-block;width:12px;height:12px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 2px rgba(0,0,0,0.2);"></span>`
  });

  return (
    <div className="relative w-full rounded-lg overflow-hidden border shadow-md" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {markers.map((m, idx) => (
          <Marker key={idx} position={m.position} icon={icon(m.color)} />
        ))}

        {polyPoints.length === 2 && (
          <>
            <Polyline positions={polyPoints} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7 }} />
            <FitBounds points={polyPoints} />
          </>
        )}

        {!originCoords && !destCoords && userPosition && (
          <FitBounds points={[userPosition]} />
        )}

        <ClickHandler />
      </MapContainer>

      {interactive && (
        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
          <p className="text-sm font-medium mb-2">Click on the map to select locations</p>
          <p className="text-xs text-muted-foreground">
            Next click: {clickStep === 'origin' ? 'Origin' : 'Destination'}
          </p>
        </div>
      )}
      {etaText && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-md shadow">
          <span className="text-sm font-medium">{etaText}</span>
        </div>
      )}
    </div>
  );
};

export default RideMap;
