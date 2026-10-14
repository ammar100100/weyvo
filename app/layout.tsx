import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = {
  title: "Weyvo — Everyday, elevated",
  description: "Discover modern silver bracelets made for every day."
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
