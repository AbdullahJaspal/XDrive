export interface UkLocation {
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  isAirport: boolean;
}

export const GOOGLE_MAPS_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

function getComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string,
): string | undefined {
  return components.find((component) => component.types.includes(type))?.long_name;
}

export function parseGooglePlace(place: google.maps.places.PlaceResult): UkLocation | null {
  const location = place.geometry?.location;
  if (!location) return null;

  const components = place.address_components ?? [];
  let postcode = (getComponent(components, 'postal_code') ?? '').toUpperCase();

  if (!postcode && place.formatted_address) {
    const match = /\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}|GIR\s?0AA)\b/i.exec(
      place.formatted_address,
    );
    postcode = match?.[1]?.toUpperCase().replace(/\s+/g, ' ') ?? '';
  }

  const streetNumber = getComponent(components, 'street_number');
  const route = getComponent(components, 'route');
  const locality =
    getComponent(components, 'locality') ??
    getComponent(components, 'postal_town') ??
    getComponent(components, 'administrative_area_level_2');

  let address: string;

  if (place.types?.includes('establishment') && place.name) {
    const street = [streetNumber, route].filter(Boolean).join(' ');
    address = street ? `${place.name}, ${street}` : place.name;
  } else if (streetNumber && route) {
    address = `${streetNumber} ${route}`;
  } else if (route) {
    address = route;
  } else if (locality) {
    address = locality;
  } else if (place.formatted_address) {
    address = place.formatted_address
      .replace(/,?\s*UK$/i, '')
      .replace(new RegExp(`,?\\s*${postcode.replace(/\s+/g, '\\s*')}`, 'i'), '')
      .trim();
  } else {
    address = place.name ?? '';
  }

  const isAirport =
    place.types?.includes('airport') === true ||
    /\bairport\b/i.test(place.name ?? '') ||
    /\bairport\b/i.test(place.formatted_address ?? '');

  return {
    address: address.trim(),
    postcode,
    lat: location.lat(),
    lng: location.lng(),
    isAirport,
  };
}
