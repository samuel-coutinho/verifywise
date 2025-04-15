


console.log(" process.env 2", process.env);
console.log("import.meta 2", import.meta);
export const ENV_VARs = {
  URL: import.meta.env.VITE_APP_API_BASE_URL,
};

export const PROCESS_ENV = process.env

export const IMPORT_META_ENV = import.meta.env


