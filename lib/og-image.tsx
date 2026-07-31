import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_ALT = "Savora — Save Together. Grow Together.";

export async function renderBrandImage() {
  const logoData = await readFile(join(process.cwd(), "public/logo.png"), "base64");
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111827 0%, #2562EB 100%)",
        }}
      >
        <img src={logoSrc} alt="" width={140} height={140} style={{ borderRadius: 28 }} />
        <div style={{ marginTop: 40, fontSize: 64, fontWeight: 700, color: "#FFFFFF" }}>
          Savora
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#10B981" }}>
          Save Together. Grow Together.
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE }
  );
}
