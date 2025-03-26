// export const ENV_VARs = {
//   URL: `${window.location.protocol}//${window.location.hostname}:3000`
// };

export const ENV_VARs = {
  URL: import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:3000",
};
