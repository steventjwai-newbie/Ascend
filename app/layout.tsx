import type { Metadata } from "next";
import "./globals.css";
import "./evidence.css";

export const metadata: Metadata = {
  title: "Ascend Alpha — Evidence-First Operations",
  description: "A redacted, source-linked food-margin investigation from Team Ascend.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
