import Navbar from '@/components/marketing/navbar'
import Footer from '@/components/marketing/footer'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
