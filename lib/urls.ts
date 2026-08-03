const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://savora.xyz";

// Until a distinct app domain (e.g. app.savora.xyz) is configured via
// NEXT_PUBLIC_APP_URL, the app lives at /main on whatever host is serving
// this deployment, so a relative link is always correct.
export function appUrl(path = "/") {
  if (APP_URL) return `${APP_URL}${path}`;
  return `/main${path === "/" ? "" : path}`;
}

export function siteUrl(path = "/") {
  return `${SITE_URL}${path}`;
}

// True once the current request's host is the dedicated app subdomain,
// meaning proxy.ts is rewriting clean paths (e.g. /groups) to /main/groups
// internally and links can stay clean. Otherwise (single shared domain,
// e.g. the interim savora-puce.vercel.app deployment) links need the
// /main prefix to resolve directly, since there's no rewrite to rely on.
export function mainBasePath(hostname: string) {
  return hostname.startsWith("app.") ? "" : "/main";
}

export function mainHref(basePath: string, href: string) {
  if (!basePath) return href;
  return href === "/" ? basePath : `${basePath}${href}`;
}
