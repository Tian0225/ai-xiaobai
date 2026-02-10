import Navbar from "@/components/marketing/navbar";
import HeroSection from "@/components/marketing/hero-section";
import Footer from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroSection />
        {/* 后续 Milestone 2-3 会添加更多 sections */}
      </main>
      <Footer />
    </>
  );
}
