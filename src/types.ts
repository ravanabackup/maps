export interface Intersection {
  name: string;
  lat: number;
  lng: number;
  cameras: string[];
  timing: string;
  traffic: string;
  green: string;
  red: string;
  speedLimit: number;
}

export interface NavState {
  darkMode: boolean;
  wakeLock: boolean;
  beepEnabled: boolean;
  vibrateEnabled: boolean;
  camAlertEnabled: boolean;
  camAlertDist: number;
  speedLimit: number;
  hwySpeedLimit: number;
  currentSpeed: number;
  heading: number;
  isNavigating: boolean;
  destination: { lat: number; lng: number; name: string } | null;
  routeCoords: [number, number][];
  routeIndex: number;
  autoRecenter: boolean;
  lastBeepTime: number;
  mapStyle: 'osm' | 'dark' | 'satellite' | 'topo';
  accuracy: number | null;
}
