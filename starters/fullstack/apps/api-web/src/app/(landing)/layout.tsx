import { Footer } from '@/components/footer'
import { AuthNavbar } from '@/features/auth/auth-navbar'

export default function ExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <AuthNavbar />
      <main id="main-content" className="h-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
