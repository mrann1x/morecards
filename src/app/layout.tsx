import Link from "next/link"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import ThemeProvider from "./components/Theme-Provider"
import ThemeToggle from "./components/Theme-Toggle"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakartaSans.variable}>
      <head>
        <title>MorecCards</title>
      </head>

      <body className="transition-colors">

        <ThemeProvider>

          <header className="sticky top-0 z-50 border-b border-black/5 dark:border-white/10 bg-white/55 dark:bg-black/25 backdrop-blur">
            <div className="container-app flex items-center justify-between gap-4 py-4">

              <Link href="/" className="flex items-baseline gap-2">
                <span className="site-title">
                  MorecCards
                </span>
                <span className="site-subtitle hidden sm:inline">
                  Flashcards, clean and fast
                </span>
              </Link>

              <div className="flex items-center gap-3 sm:gap-6">

                <nav className="nav-group flex items-center gap-6">
                  <Link href="/" className="nav-link">
                    Home
                  </Link>
                  <Link href="/categories" className="nav-link">
                    Categories
                  </Link>
                </nav>

                <ThemeToggle />

              </div>

            </div>
          </header>

          {/* CONTENT */}
          <main className="container-app py-8">
            {children}
          </main>

        </ThemeProvider>

      </body>
    </html>
  )
}
