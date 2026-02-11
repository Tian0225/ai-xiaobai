import Navbar from "@/components/marketing/navbar";
import HeroSection from "@/components/marketing/hero-section";
import HomeContent from "@/components/marketing/home-content";
import Footer from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroSection />
        <HomeContent />
      </main>
      <Footer />
    </>
  );
}
