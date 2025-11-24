import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE;

  const cats = await fetch(`${base}/api/cats`).then(r => r.json());

  const image = `${base}/api/image?a=${cats.a.url}&b=${cats.b.url}`;

  return new NextResponse(
    JSON.stringify({
      version: "vNext",
      image,
      buttons: [
        { label: "Vote Cat A", action: "post", value: "a" },
        { label: "Vote Cat B", action: "post", value: "b" }
      ]
    }),
    {
      headers: {
        "Content-Type": "application/vnd.farcaster.frame+json"
      }
    }
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const buttonIndex = body?.untrustedData?.buttonIndex || 0;

  const vote = buttonIndex === 0 ? "a" : "b";

  const resultImage = `${process.env.NEXT_PUBLIC_BASE}/api/image?result=${vote}`;

  return NextResponse.json({
    version: "vNext",
    image: resultImage,
    buttons: [
      {
        label: "Vote Again",
        action: "link",
        target: `${process.env.NEXT_PUBLIC_BASE}/frame`
      }
    ]
  });
}
