import Navbar from '@/components/marketing/navbar'
import Footer from '@/components/marketing/footer'
import LegacyNavbar from '@/components/marketing/legacy-navbar'
import LegacyFooter from '@/components/marketing/legacy-footer'
import { isUiRevampEnabled } from '@/lib/ui-revamp'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const revampEnabled = isUiRevampEnabled()

  return (
    <>
      {revampEnabled ? <Navbar /> : <LegacyNavbar />}
      {children}
      {revampEnabled ? <Footer /> : <LegacyFooter />}
    </>
  )
}
