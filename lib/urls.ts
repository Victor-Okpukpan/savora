const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://app.localhost:3000";

export function appUrl(path = "/") {
  return `${APP_URL}${path}`;
}
