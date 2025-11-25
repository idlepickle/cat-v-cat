import { fetchMetadata } from "frames.js/next";

export async function generateMetadata() {
  // This is important for Farcaster to recognize the frame
  // Change the base URL to your actual Vercel deployment URL once you have it.
  // For now, this dynamic URL will work in most context.
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  return {
    title: "Cat v Cat Game",
    // Provide the URL to the API route we just created
    other: await fetchMetadata(new URL("/api/frame", baseUrl)),
  };
}

export default function Page() {
  return <span>Go to a Farcaster client to play Cat v Cat!</span>;
}
