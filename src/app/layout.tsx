// src/app/layout.tsx

import "@/styles/globals.css"
import { Providers } from "./providers"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Harper Lou Art Portfolio",
  description: "The artworks of Harper Lou",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}