import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const a = searchParams.get("a");
  const b = searchParams.get("b");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          justifyContent: "space-around",
          alignItems: "center",
          background: "white"
        }}
      >
        <img src={a ?? ""} width={300} height={300} />
        <h1>VS</h1>
        <img src={b ?? ""} width={300} height={300} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
