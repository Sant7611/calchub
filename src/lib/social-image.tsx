import { ImageResponse } from "next/og";

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const SOCIAL_IMAGE_ALT =
  "OnCalculator — free online calculators for finance, health, math, conversions and everyday calculations";

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #ffffff 100%)",
          color: "#0f172a",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "#c7d2fe",
            opacity: 0.32,
            top: -180,
            right: -80,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "#e0e7ff",
            opacity: 0.6,
            bottom: -170,
            left: 360,
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: 20,
                background: "#4f46e5",
                display: "flex",
                flexDirection: "column",
                padding: 15,
                gap: 9,
                boxShadow: "0 16px 34px rgba(79, 70, 229, 0.22)",
              }}
            >
              <div
                style={{
                  height: 18,
                  width: "100%",
                  borderRadius: 5,
                  background: "#eef2ff",
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {[0, 1, 2, 3].map((key) => (
                  <div
                    key={key}
                    style={{
                      width: 21,
                      height: 14,
                      borderRadius: 4,
                      background: "#ffffff",
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: -1.5,
              }}
            >
              <span>On</span>
              <span style={{ color: "#4f46e5" }}>Calculator</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 690,
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 66,
                lineHeight: 1.04,
                fontWeight: 800,
                letterSpacing: -2.5,
              }}
            >
              <span>Calculate clearly.</span>
              <span>Decide confidently.</span>
            </div>

            <div
              style={{
                fontSize: 27,
                lineHeight: 1.45,
                color: "#475569",
                maxWidth: 650,
              }}
            >
              Free online calculators for finance, health, math, conversions, date & time, and everyday decisions.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              fontWeight: 700,
              color: "#4338ca",
            }}
          >
            oncalculator.app
            <span style={{ color: "#94a3b8", fontWeight: 500 }}>•</span>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Fast • Free • Mobile-friendly</span>
          </div>
        </div>

        <div
          style={{
            width: 330,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 300,
              height: 390,
              borderRadius: 36,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 28px 70px rgba(15, 23, 42, 0.14)",
              padding: 26,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              transform: "rotate(3deg)",
            }}
          >
            <div
              style={{
                height: 92,
                borderRadius: 20,
                background: "#0f172a",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                padding: "18px 20px",
                color: "#ffffff",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              42,580
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"].map(
                (label, index) => (
                  <div
                    key={`${label}-${index}`}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        label === "=" ? "#4f46e5" : index % 4 === 3 ? "#eef2ff" : "#f8fafc",
                      color:
                        label === "=" ? "#ffffff" : index % 4 === 3 ? "#4338ca" : "#334155",
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {label}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE,
  );
}
