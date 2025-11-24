// app/layout.tsx
import { ReactNode } from "react";

export const metadata = {
  title: "Cat v Cat Frame",
  description: "Farcaster voting frame"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
