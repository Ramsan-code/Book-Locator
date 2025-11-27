/**
 * Location utilities for Book_Locator
 * Handles geolocation, distance calculation, and location formatting
 */

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

/**
 * Get user's current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Format distance for display
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  } else if (km < 10) {
    return `${km.toFixed(1)}km away`;
  } else {
    return `${Math.round(km)}km away`;
  }
};

/**
 * Reverse geocode coordinates to address (requires Google Maps API)
 * For now, returns a placeholder
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ address: string; city: string }> => {
  // TODO: Implement with Google Maps Geocoding API
  // For now, return placeholder
  return {
    address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    city: "Unknown",
  };
};

/**
 * Sort items by distance from a reference point
 */
export const sortByDistance = <T extends { latitude?: number; longitude?: number }>(
  items: T[],
  userLat: number,
  userLon: number
): (T & { distance?: number })[] => {
  return items
    .map((item) => {
      if (item.latitude && item.longitude) {
        const distance = calculateDistance(userLat, userLon, item.latitude, item.longitude);
        return { ...item, distance };
      }
      return { ...item, distance: undefined };
    })
    .sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
};
