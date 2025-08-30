export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAzjs-zFMmK8AFRXJsoBwef8ZL3UMRnChI';

console.log('Environment check:', {
  NODE_ENV: import.meta.env.MODE,
  API_KEY_EXISTS: !!GOOGLE_MAPS_API_KEY,
  API_KEY_LENGTH: GOOGLE_MAPS_API_KEY?.length
});