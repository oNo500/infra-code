import { Footer } from '@/components/footer'
import { AuthNavbar } from '@/features/auth/auth-navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <AuthNavbar />
      <main id="main-content" className="container mx-auto h-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
