export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
  description?: string;
}

export const STATIONS: Station[] = [
  { id: 'sg1', name: 'Singapore Station', lat: 1.3521, lon: 103.8198 },
  { id: 'th1', name: 'Bangkok Station', lat: 13.7563, lon: 100.5018 },
  // add more...
];
