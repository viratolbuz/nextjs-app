const getEnv = (key: string): string | undefined => {
  if (typeof process === "undefined") return undefined;
  const value = process.env[key];
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeBool = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  const v = value.toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(v)) return true;
  if (["0", "false", "no", "n", "off"].includes(v)) return false;
  return fallback;
};

const envName = getEnv("NEXT_PUBLIC_ENV") ?? process.env.NODE_ENV ?? "development";

export const isDev = envName === "development";
export const isProd = envName === "production";

export const API_URL =
  getEnv("NEXT_PUBLIC_API_URL") ||
  getEnv("NEXT_PUBLIC_APP_URL") ||
  (isDev ? "http://localhost:3000" : "https://example.com");

export const USE_DUMMY = normalizeBool(
  getEnv("NEXT_PUBLIC_USE_DUMMY_DATA"),
  isDev,
);

export const ENV = {
  name: envName,
  isDev,
  isProd,
  API_URL,
  USE_DUMMY,
} as const;
