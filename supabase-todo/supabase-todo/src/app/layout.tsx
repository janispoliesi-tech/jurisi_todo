import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Saraksts",
    template: "%s · Saraksts",
  },
  description:
    "Uzdevumu saraksts ar kategorijām un arhīvu. Darbojas uz telefona, planšetes un datora.",
  manifest: "/manifest.webmanifest",
  applicationName: "Saraksts",
  appleWebApp: {
    capable: true,
    title: "Saraksts",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d11" },
  ],
};

/** Uzstāda tēmu pirms pirmā zīmējuma, lai nav baltā uzplaiksnījuma. */
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem("saraksts-theme");
    if (t === "dark" || t === "light") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="lv" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
