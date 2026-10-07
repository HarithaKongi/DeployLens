import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeployLens — Deployment Intelligence",
  description: "Monitor repositories, deployments, build performance, and release health in one place.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}