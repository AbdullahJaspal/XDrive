interface LatLng {
  lat: number;
  lng: number;
}

export interface DrivingRoute {
  distanceMetres: number;
  durationSeconds: number;
}

interface DirectionsResponse {
  status: string;
  routes?: {
    legs?: {
      distance?: { value: number };
      duration?: { value: number };
    }[];
  }[];
}

export async function getDrivingRoute(
  origin: LatLng,
  destination: LatLng,
): Promise<DrivingRoute | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    origin: `${String(origin.lat)},${String(origin.lng)}`,
    destination: `${String(destination.lat)},${String(destination.lng)}`,
    mode: 'driving',
    region: 'gb',
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as DirectionsResponse;
  const leg = data.routes?.[0]?.legs?.[0];
  if (data.status !== 'OK' || !leg?.distance?.value) return null;

  return {
    distanceMetres: leg.distance.value,
    durationSeconds: leg.duration?.value ?? 0,
  };
}
