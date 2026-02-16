import Navbar from '@/components/marketing/navbar'
import LegacyNavbar from '@/components/marketing/legacy-navbar'
import { isUiRevampEnabled } from '@/lib/ui-revamp'

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const revampEnabled = isUiRevampEnabled()

  return (
    <>
      {revampEnabled ? <Navbar /> : <LegacyNavbar />}
      {children}
    </>
  )
}
