const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://app.localhost:3000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://savora.xyz";

export function appUrl(path = "/") {
  return `${APP_URL}${path}`;
}

export function siteUrl(path = "/") {
  return `${SITE_URL}${path}`;
}
