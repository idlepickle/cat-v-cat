import { fetchMetadata } from "frames.js/next";

// 👈 NEW FIX: Force Next.js to run this page dynamically on every request
export const dynamic = 'force-dynamic';

// 👉 REPLACE 'YOUR-VERCEL-DOMAIN.VERCEL.APP' with your actual domain!
const YOUR_DOMAIN = "https://cat-v-cat.vercel.app";

export async function generateMetadata() {
  return {
    title: "Cat v Cat",
    // This fetches the metadata from your frame API endpoint
    other: await fetchMetadata(new URL("/api/frame", YOUR_DOMAIN)),
  };
}

export default function Page() {
  return <span>Go to a Farcaster client to play Cat v Cat!</span>;
}
