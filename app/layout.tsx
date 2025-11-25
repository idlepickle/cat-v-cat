import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cat v Cat",
  description: "A simple Farcaster frame game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
