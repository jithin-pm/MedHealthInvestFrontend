/**
 * Device Location Service for Security Logging & Verification
 */

const LOCATION_CACHE_KEY = 'mhi_verified_location';

/**
 * Retrieves valid cached location from current session.
 */
export const getCachedLocation = () => {
  try {
    const raw = sessionStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000)) {
      return parsed;
    }
  } catch (e) {}
  return null;
};

/**
 * Checks the browser's current geolocation permission state.
 * @returns {Promise<'granted'|'prompt'|'denied'|'unsupported'>}
 */
export const checkLocationPermission = async () => {
  if (typeof window === 'undefined' || !navigator.geolocation) return 'unsupported';
  if (!navigator.permissions || !navigator.permissions.query) return 'prompt';
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch (e) {
    return 'prompt';
  }
};

/**
 * Prompts user for geolocation and reverse-geocodes into a friendly address string.
 * @param {object} options 
 * @returns {Promise<{location: string, latitude: string, longitude: string, accuracy?: number}>}
 */
export const requestDeviceLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject({
        code: 'UNSUPPORTED',
        message: 'Geolocation is not supported by your browser.'
      });
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: options.timeout || 12000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let locationName = null;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (response.ok) {
            const data = await response.json();
            const parts = [
              data.city || data.locality,
              data.principalSubdivision,
              data.countryName
            ].filter(Boolean);
            if (parts.length > 0) {
              locationName = parts.join(', ');
            }
          }
        } catch (geoErr) {
          console.warn('Reverse geocode fallback:', geoErr.message);
        }

        if (!locationName) {
          locationName = `${Number(latitude).toFixed(4)}°, ${Number(longitude).toFixed(4)}°`;
        }

        const locationData = {
          location: locationName,
          latitude: String(latitude),
          longitude: String(longitude),
          accuracy: accuracy ? Math.round(accuracy) : null,
          timestamp: Date.now()
        };

        try {
          sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
        } catch (e) {}

        resolve(locationData);
      },
      (error) => {
        let code = 'UNKNOWN_ERROR';
        let message = 'Unable to retrieve device location. Please try again.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            message = 'Location access was denied. Location permission is required for security verification before login.';
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'POSITION_UNAVAILABLE';
            message = 'Device location is currently unavailable. Please verify your device GPS / location settings.';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            message = 'Location request timed out. Please try again.';
            break;
          default:
            break;
        }

        reject({ code, message, originalError: error });
      },
      geoOptions
    );
  });
};

