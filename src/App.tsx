import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Settings, Search, Home, Briefcase, RotateCcw, Compass, AlertTriangle, X, ChevronLeft, Minus, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { INTERSECTIONS, WORK_LOCATION, HOME_LOCATION } from './data';
import { NavState } from './types';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Markers
const createLocationIcon = (heading: number) => L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px; background:#0A84FF; border:3px solid #fff; border-radius:50%; box-shadow:0 2px 10px rgba(10,132,255,0.5); transform:rotate(${heading}deg); position:relative;">
          <div style="position:absolute;top:-10px;left:50%; transform:translateX(-50%); width:0;height:0; border-left:9px solid transparent; border-right:9px solid transparent; border-bottom:14px solid #0A84FF;"></div>
        </div>`,
  iconSize: [28, 42],
  iconAnchor: [14, 21]
});

const destIcon = L.divIcon({
  className: '',
  html: `<div class="bg-red-500 w-[30px] h-[30px] border-[3px] border-white rounded-t-full rounded-br-full -rotate-45 shadow-lg flex items-center justify-center">
          <div class="rotate-45 text-white text-[14px]">📍</div>
        </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

const tlIcon = L.divIcon({
  className: '',
  html: `<div class="bg-[#222] text-white w-7 h-7 rounded-md flex items-center justify-center text-sm border-2 border-[#444] shadow-md">🚦</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Helper: Haversine distance
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function movePoint(lat: number, lng: number, bearing: number, distanceMeters: number) {
  const R = 6371000;
  const brng = (bearing * Math.PI) / 180;
  const d = distanceMeters;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d / R) +
      Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
      Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [
    (lat2 * 180) / Math.PI,
    ((lon2 * 180) / Math.PI + 540) % 360 - 180
  ] as [number, number];
}

function formatDist(meters: number) {
  if (meters >= 1000) return (meters / 1000).toFixed(1) + ' km';
  return Math.round(meters) + ' m';
}

function formatTime(seconds: number) {
  if (!seconds || seconds < 0) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

// Map Interactions Component
function MapController({ 
  center, 
  zoom, 
  active, 
  isNavigating,
  heading,
  speed,
  onLongPress 
}: { 
  center: [number, number], 
  zoom: number, 
  active: boolean,
  isNavigating: boolean,
  heading: number,
  speed: number,
  onLongPress: (lat: number, lng: number) => void
}) {
  const map = useMap();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (active && center) {
      if (isNavigating) {
        // Smoothly follow the user with a tight zoom like Google Maps navigation
        const currentCenter = map.getCenter();
        const dist = haversine(currentCenter.lat, currentCenter.lng, center[0], center[1]) * 1000;

        // Forward-looking camera: place the user in the lower third of the screen
        const forwardPoint = movePoint(center[0], center[1], heading, 60);

        // Dynamic zoom based on speed
        const speedZoom = 18.5 - Math.min(2, speed / 35);
        const targetZoom = Math.max(16.5, Math.min(19, speedZoom));

        if (dist > 3) {
          map.setView(forwardPoint, targetZoom, {
            animate: true,
            duration: 1.2,
            noMoveStart: true
          });
        }
      } else {
        map.setView(center, zoom, { animate: true, duration: 0.5 });
      }
    }
  }, [center, zoom, active, map, isNavigating, heading, speed]);

  useMapEvents({
    mousedown(e) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        onLongPress(e.latlng.lat, e.latlng.lng);
      }, 800);
    },
    mouseup() {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    contextmenu(e) {
      onLongPress(e.latlng.lat, e.latlng.lng);
    },
    dragstart() {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    zoomstart() {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  });

  return null;
}

export default function App() {
  const [state, setState] = useState<NavState>({
    darkMode: true,
    wakeLock: true,
    beepEnabled: true,
    vibrateEnabled: true,
    camAlertEnabled: true,
    camAlertDist: 500,
    speedLimit: 50,
    hwySpeedLimit: 80,
    currentSpeed: 0,
    heading: 0,
    isNavigating: false,
    destination: null,
    routeCoords: [],
    routeIndex: 0,
    autoRecenter: true,
    lastBeepTime: 0,
    mapStyle: 'dark',
    accuracy: null
  });

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navInstruction, setNavInstruction] = useState('Starting navigation...');
  const [navSubText, setNavSubText] = useState('');
  const [remainingDist, setRemainingDist] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [cameraAlert, setCameraAlert] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<any>(null);

  const ensureAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playBeep = useCallback((freq = 880, duration = 0.15, type: OscillatorType = 'square') => {
    if (!state.beepEnabled) return;
    try {
      ensureAudioCtx();
      const osc = audioCtxRef.current!.createOscillator();
      const gain = audioCtxRef.current!.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(audioCtxRef.current!.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current!.currentTime + duration);
      osc.stop(audioCtxRef.current!.currentTime + duration);
    } catch (e) {}
  }, [state.beepEnabled]);

  // Wake Lock Logic
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (state.wakeLock) requestWakeLock();
    else if (wakeLockRef.current) wakeLockRef.current.release();
  }, [state.wakeLock]);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        setPosition([latitude, longitude]);
        setLoading(false);
        setState(s => ({
          ...s,
          currentSpeed: speed ? speed * 3.6 : 0,
          heading: heading !== null ? heading : s.heading,
          accuracy: accuracy
        }));
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Routing
  const fetchRoute = async (destLat: number, destLng: number, destName: string) => {
    if (!position) return;
    const org = `${position[1]},${position[0]}`;
    const dst = `${destLng},${destLat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${org};${dst}?overview=full&geometries=geojson&steps=true`;
    
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]]);
        setState(s => ({
          ...s,
          isNavigating: true,
          destination: { lat: destLat, lng: destLng, name: destName },
          routeCoords: coords,
          routeIndex: 0
        }));
        setRemainingDist(route.distance);
        setRemainingTime(route.duration);
        setNavInstruction('Head to destination');
        setNavSubText(destName);
        playBeep(500, 0.1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stopNavigation = () => {
    setState(s => ({ ...s, isNavigating: false, destination: null, routeCoords: [] }));
  };

  // Search
  const searchPlaces = async (query: string) => {
    if (query.length < 3) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Chandigarh')}&limit=6&countrycodes=in`;
      const resp = await fetch(url);
      const data = await resp.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (e) {}
  };

  // Camera Check
  const lastCamIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state.camAlertEnabled || !position) return;
    let nearCam = null;
    let minDist = Infinity;
    INTERSECTIONS.forEach(inter => {
      const d = haversine(position[0], position[1], inter.lat, inter.lng) * 1000;
      if (d < state.camAlertDist && d < minDist) {
        minDist = d;
        nearCam = inter;
      }
    });
    
    if (nearCam) {
      const camName = (nearCam as any).name;
      setCameraAlert(`${camName.split('(')[0]} — ${Math.round(minDist)}m`);
      
      // Sound alert logic: beep once per encounter
      if (lastCamIdRef.current !== camName) {
        playBeep(600, 0.2, 'triangle');
        setTimeout(() => playBeep(800, 0.2, 'triangle'), 250);
        lastCamIdRef.current = camName;
      }
    } else {
      setCameraAlert(null);
      lastCamIdRef.current = null;
    }
  }, [position, state.camAlertEnabled, state.camAlertDist, playBeep]);

  const tileUrls = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  return (
    <div className={cn("h-screen w-screen overflow-hidden flex flex-col font-sans", state.darkMode ? "bg-black text-white" : "bg-white text-black")}>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[9999] bg-white dark:bg-black flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="font-semibold text-gray-500">Acquiring GPS signal...</div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pt-[max(1rem,env(safe-area-inset-top))] flex gap-3 pointer-events-none">
        <div className="flex-1 relative pointer-events-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input 
            type="text" 
            placeholder="Search destination..." 
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] shadow-lg outline-none focus:border-blue-500"
            onChange={(e) => searchPlaces(e.target.value)}
            onFocus={() => setShowSearchResults(true)}
          />
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-14 left-0 right-0 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] shadow-2xl overflow-hidden max-height-[250px] overflow-y-auto">
              {searchResults.map((r, i) => (
                <div 
                  key={i} 
                  className="p-3 border-b border-gray-100 dark:border-[#222] active:bg-gray-100 dark:active:bg-[#222] cursor-pointer"
                  onClick={() => {
                    fetchRoute(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',')[0]);
                    setShowSearchResults(false);
                  }}
                >
                  <div className="font-bold text-sm">{r.display_name.split(',').slice(0, 2).join(',')}</div>
                  <div className="text-xs opacity-60 truncate">{r.display_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button 
          className="w-12 h-12 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] shadow-lg flex items-center justify-center pointer-events-auto"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer 
          center={[30.733, 76.788]} 
          zoom={13} 
          zoomControl={false} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url={tileUrls[state.mapStyle]} />
          {position && <Marker position={position} icon={createLocationIcon(state.heading)} />}
          {state.isNavigating && state.destination && (
            <Marker position={[state.destination.lat, state.destination.lng]} icon={destIcon} />
          )}
          {state.isNavigating && state.routeCoords.length > 0 && (
            <Polyline positions={state.routeCoords} pathOptions={{ color: "#0A84FF", weight: 6, opacity: 0.8 }} />
          )}
          {INTERSECTIONS.map((inter, i) => (
            <Marker key={i} position={[inter.lat, inter.lng]} icon={tlIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-bold mb-1">{inter.name}</div>
                  <div className="text-xs mb-2">
                    Cameras: {inter.cameras.join(', ')}<br/>
                    Limit: {inter.speedLimit} km/h
                  </div>
                  <button 
                    className="w-full bg-blue-500 text-white py-1.5 rounded-lg text-sm font-bold"
                    onClick={() => fetchRoute(inter.lat, inter.lng, inter.name)}
                  >
                    Navigate Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController 
            center={position || [30.733, 76.788]} 
            zoom={16} 
            active={state.autoRecenter} 
            isNavigating={state.isNavigating}
            heading={state.heading}
            speed={state.currentSpeed}
            onLongPress={(lat, lng) => {
              playBeep(1000, 0.2, 'sine');
              if (navigator.vibrate) navigator.vibrate(50);
              fetchRoute(lat, lng, "Dropped Pin");
            }}
          />
        </MapContainer>

        {/* Floating Map Controls */}
        <div className="absolute left-4 top-24 z-[1000] flex flex-col gap-3">
          <div className="w-11 h-11 bg-white dark:bg-[#111] rounded-full border border-gray-200 dark:border-[#222] shadow-lg flex items-center justify-center transition-transform" style={{ transform: `rotate(${-state.heading}deg)` }}>
            <Compass className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <button 
          className={cn("absolute bottom-[240px] right-4 z-[1000] w-11 h-11 rounded-full border shadow-lg flex items-center justify-center transition-colors", state.autoRecenter ? "bg-blue-500 border-blue-600 text-white" : "bg-white dark:bg-[#111] border-gray-200 dark:border-[#222]")}
          onClick={() => setState(s => ({ ...s, autoRecenter: true }))}
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {cameraAlert && (
          <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-[1000] bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap">
            <AlertTriangle className="w-4 h-4" />
            {cameraAlert}
          </div>
        )}

        {/* Speedometer */}
        <div className={cn(
          "absolute bottom-[100px] right-4 z-[1000] w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl transition-all duration-300",
          state.currentSpeed > state.speedLimit + 10 ? "border-red-500 bg-red-500/10" : 
          state.currentSpeed > state.speedLimit ? "border-orange-500 bg-orange-500/10" : 
          "border-gray-200 dark:border-[#222] bg-white dark:bg-[#111]"
        )}>
          <div className={cn("text-4xl font-black leading-none", state.currentSpeed > state.speedLimit ? "text-orange-500" : "text-black dark:text-white")}>
            {Math.round(state.currentSpeed)}
          </div>
          <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">km/h</div>
          <div className="text-[9px] font-bold mt-2 px-2 py-0.5 bg-gray-100 dark:bg-[#222] rounded text-gray-500">LIMIT {state.speedLimit}</div>
        </div>

        {/* Accuracy Info */}
        <div className="absolute bottom-[100px] left-4 z-[1000] flex flex-col gap-2">
          <div className="bg-white dark:bg-[#111] p-2 px-3 rounded-lg border border-gray-200 dark:border-[#222] shadow-md">
            <div className="text-[10px] opacity-50 font-bold uppercase">Accuracy</div>
            <div className="text-sm font-bold">{state.accuracy ? `±${Math.round(state.accuracy)}m` : '--'}</div>
          </div>
          <div className="bg-white dark:bg-[#111] p-2 px-3 rounded-lg border border-gray-200 dark:border-[#222] shadow-md">
            <div className="text-[10px] opacity-50 font-bold uppercase">Signal</div>
            <div className={cn("text-xs font-bold", !state.accuracy || state.accuracy > 50 ? "text-red-500" : "text-green-500")}>
              {state.accuracy && state.accuracy < 20 ? 'Excellent' : state.accuracy && state.accuracy < 50 ? 'Good' : 'Searching...'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="relative z-[1001] bg-white dark:bg-[#111] border-t border-gray-200 dark:border-[#222] rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {!state.isNavigating ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button 
                className="flex-1 flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#222] active:scale-95 transition-transform"
                onClick={() => fetchRoute(HOME_LOCATION.lat, HOME_LOCATION.lng, 'Home')}
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mb-1 shadow-md">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Home</span>
              </button>
              <button 
                className="flex-1 flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#222] active:scale-95 transition-transform"
                onClick={() => fetchRoute(WORK_LOCATION.lat, WORK_LOCATION.lng, WORK_LOCATION.name)}
              >
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white mb-1 shadow-md">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Work</span>
              </button>
              <button 
                className="flex-1 flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#222] active:scale-95 transition-transform"
                onClick={() => {
                  const near = INTERSECTIONS[0]; // Logic to find nearest...
                  fetchRoute(near.lat, near.lng, near.name);
                }}
              >
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white mb-1 shadow-md">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Camera</span>
              </button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Nearby Intersections</h3>
              <div className="max-h-[160px] overflow-y-auto space-y-1">
                {INTERSECTIONS.slice(0, 4).map((inter, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 p-2 rounded-xl active:bg-gray-50 dark:active:bg-[#1a1a1a]"
                    onClick={() => fetchRoute(inter.lat, inter.lng, inter.name)}
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                      🚦
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{inter.name.split('(')[0]}</div>
                      <div className="text-[10px] opacity-50">{inter.cameras.join(' • ')}</div>
                    </div>
                    <div className="text-xs font-bold text-blue-500">
                      {position ? formatDist(haversine(position[0], position[1], inter.lat, inter.lng) * 1000) : '--'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                ↑
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-black leading-tight truncate">{navInstruction}</div>
                <div className="text-sm opacity-60 truncate">{navSubText}</div>
              </div>
            </div>
            
            <div className="flex bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#222]">
              <div className="flex-1 p-3 border-r border-gray-100 dark:border-[#222] text-center">
                <div className="text-lg font-black">{formatDist(remainingDist)}</div>
                <div className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">Distance</div>
              </div>
              <div className="flex-1 p-3 border-r border-gray-100 dark:border-[#222] text-center">
                <div className="text-lg font-black text-blue-500">{formatTime(remainingTime)}</div>
                <div className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">ETA</div>
              </div>
              <div className="flex-1 p-3 text-center">
                <div className="text-lg font-black">{formatDist(remainingDist)}</div>
                <div className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">Left</div>
              </div>
            </div>
            
            <button 
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              onClick={stopNavigation}
            >
              <X className="w-6 h-6" /> END NAVIGATION
            </button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[5000] bg-white dark:bg-black overflow-y-auto pt-[env(safe-area-inset-top)]">
          <div className="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-[#222] sticky top-0 bg-white dark:bg-black z-10">
            <button onClick={() => setShowSettings(false)} className="p-2"><ChevronLeft /></button>
            <h2 className="text-xl font-black">Settings</h2>
          </div>
          
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Display</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">AMOLED Dark Mode</div>
                  <div className="text-xs opacity-50">Pure black background for OLED</div>
                </div>
                <div 
                  className={cn("w-14 h-8 rounded-full relative transition-colors border-2", state.darkMode ? "bg-green-500 border-green-500" : "bg-gray-200 border-gray-300")}
                  onClick={() => setState(s => ({ ...s, darkMode: !s.darkMode }))}
                >
                  <div className={cn("absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-sm", state.darkMode ? "left-[1.6rem]" : "left-0.5")} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">Anti Screen Off</div>
                  <div className="text-xs opacity-50">Keep screen on (Wake Lock)</div>
                </div>
                <div 
                  className={cn("w-14 h-8 rounded-full relative transition-colors border-2", state.wakeLock ? "bg-green-500 border-green-500" : "bg-gray-200 border-gray-300")}
                  onClick={() => setState(s => ({ ...s, wakeLock: !s.wakeLock }))}
                >
                  <div className={cn("absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-sm", state.wakeLock ? "left-[1.6rem]" : "left-0.5")} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-bold">Map Style</div>
                <select 
                  className="bg-gray-100 dark:bg-[#222] p-2 rounded-lg text-sm font-bold outline-none"
                  value={state.mapStyle}
                  onChange={(e) => setState(s => ({ ...s, mapStyle: e.target.value as any }))}
                >
                  <option value="osm">Standard</option>
                  <option value="dark">Dark</option>
                  <option value="satellite">Satellite</option>
                  <option value="topo">Topo</option>
                </select>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Alerts</h3>
              
              <div className="flex items-center justify-between">
                <div className="font-bold">Speed Limit (Urban)</div>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 bg-gray-100 dark:bg-[#222] rounded-full flex items-center justify-center" onClick={() => setState(s => ({ ...s, speedLimit: s.speedLimit - 5 }))}><Minus className="w-4 h-4" /></button>
                  <span className="font-bold w-8 text-center">{state.speedLimit}</span>
                  <button className="w-8 h-8 bg-gray-100 dark:bg-[#222] rounded-full flex items-center justify-center" onClick={() => setState(s => ({ ...s, speedLimit: s.speedLimit + 5 }))}><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">Camera Warnings</div>
                  <div className="text-xs opacity-50">Warn near known cameras</div>
                </div>
                <div 
                  className={cn("w-14 h-8 rounded-full relative transition-colors border-2", state.camAlertEnabled ? "bg-green-500 border-green-500" : "bg-gray-200 border-gray-300")}
                  onClick={() => setState(s => ({ ...s, camAlertEnabled: !s.camAlertEnabled }))}
                >
                  <div className={cn("absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-sm", state.camAlertEnabled ? "left-[1.6rem]" : "left-0.5")} />
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Speed Alert Overlay */}
      {state.currentSpeed > state.speedLimit + 15 && (
        <div className="fixed inset-0 z-[6000] bg-red-500/20 pointer-events-none flex items-center justify-center">
          <div className="text-4xl font-black text-red-500 animate-pulse drop-shadow-2xl">⚠️ SLOW DOWN</div>
        </div>
      )}

    </div>
  );
}
