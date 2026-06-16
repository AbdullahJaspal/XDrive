export const RATE_PENCE_PER_MILE = 160;
export const AIRPORT_PARKING_FEE_PENCE = 800;
export const METRES_PER_MILE = 1609.344;

export interface FareEstimate {
  distanceMetres: number;
  distanceMiles: number;
  mileagePence: number;
  airportFeePence: number;
  totalPence: number;
  pickupIsAirport: boolean;
}

export function isAirportPickup(address: string, placeIsAirport?: boolean): boolean {
  if (placeIsAirport) return true;
  return /\bairport\b/i.test(address);
}

export function calculateFareEstimate(
  distanceMetres: number,
  pickupIsAirport: boolean,
): FareEstimate {
  const distanceMiles = distanceMetres / METRES_PER_MILE;
  const mileagePence = Math.round(distanceMiles * RATE_PENCE_PER_MILE);
  const airportFeePence = pickupIsAirport ? AIRPORT_PARKING_FEE_PENCE : 0;

  return {
    distanceMetres,
    distanceMiles,
    mileagePence,
    airportFeePence,
    totalPence: mileagePence + airportFeePence,
    pickupIsAirport,
  };
}

export function formatPenceGbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function formatDistanceMiles(miles: number): string {
  return miles < 10 ? miles.toFixed(1) : Math.round(miles).toString();
}
