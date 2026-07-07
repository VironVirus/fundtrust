import type { Metadata } from "next";
import Script from "next/script";

import { AppToaster } from "@/components/providers/app-toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fundtrust | Daily Contribution Platform",
    template: "%s | Fundtrust",
  },
  description:
    "A clean, trustworthy daily contribution and thrift savings platform for customers, marketers, and administrators.",
  applicationName: "Fundtrust",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <Script
          id="theme-scheduler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function applyThemeByTime() {
                  var hour = new Date().getHours();
                  var theme = hour >= 19 || hour < 7 ? "dark" : "light";
                  var root = document.documentElement;
                  root.dataset.theme = theme;
                  root.style.colorScheme = theme;
                }

                applyThemeByTime();
                window.setInterval(applyThemeByTime, 60000);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
