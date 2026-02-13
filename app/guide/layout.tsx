import Navbar from '@/components/marketing/navbar'

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
