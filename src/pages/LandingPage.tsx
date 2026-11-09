import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import TechnologyStrip from "../components/TechnologyStrip";
import ProblemSection from "../components/ProblemSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorks from "../components/HowItWorks";
import AIChatPreview from "../components/AIChatPreview";
import VoiceAssistantSection from "../components/VoiceAssistantSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05060A] text-[#F8FAFC] antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <TechnologyStrip />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <AIChatPreview />
        <VoiceAssistantSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
