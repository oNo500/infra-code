import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-rows-[auto_1fr_auto]">
      <Navbar />
      <main id="main-content" className="h-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
