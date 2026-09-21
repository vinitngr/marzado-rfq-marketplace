import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Merzado | B2B RFQ Marketplace",
  description:
    "A focused marketplace for business requests and supplier quotations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
