import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Bujho — The Desi Charades Game | Get Early Access";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#0B0914",
        backgroundImage:
          "radial-gradient(circle at 50% 20%, #4c1d95 0%, #0b0914 70%)",
        padding: "60px 80px",
        fontFamily: "sans-serif",
        color: "white",
      }}
    >
      {/* Top Bar: Brand Pill + Live Founders Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "24px",
              backgroundColor: "#FF5964",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 900,
            }}
          >
            🎭
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            BUJHO
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 22px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 89, 100, 0.15)",
            border: "2px solid rgba(255, 89, 100, 0.4)",
            color: "#FF5964",
            fontSize: "18px",
            fontWeight: 800,
          }}
        >
          <span>🔥</span>
          <span>47 Players in Founders Circle</span>
        </div>
      </div>

      {/* Center: Hero Message & Phone On Forehead Visual Motif */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "960px",
        }}
      >
        <h1
          style={{
            fontSize: "62px",
            fontWeight: 900,
            lineHeight: 1.05,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
            margin: "0 0 20px 0",
            backgroundImage: "linear-gradient(to right, #FFFFFF, #FBCFE8)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          The Desi Charades Game Your Gang Will Fight Over
        </h1>

        <p
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "#CBD5E1",
            margin: 0,
          }}
        >
          Phone on forehead. Friends screaming. Tilt to score.
        </p>
      </div>

      {/* Bottom Bar: Value Props + Get Early Access CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          paddingTop: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            fontSize: "19px",
            fontWeight: 700,
            color: "#94A3B8",
          }}
        >
          <span>✨ 100% Free</span>
          <span>·</span>
          <span>🚫 Zero Ads</span>
          <span>·</span>
          <span>✈️ Works Offline</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 36px",
            borderRadius: "9999px",
            backgroundImage: "linear-gradient(to right, #FF5964, #FF7E47)",
            color: "#FFFFFF",
            fontSize: "22px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            boxShadow: "0 10px 25px rgba(255, 89, 100, 0.4)",
          }}
        >
          <span>Get Early Access</span>
          <span>→</span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
