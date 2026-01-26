import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { SeasonsShowcase } from '@/components/landing/SeasonsShowcase';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <SeasonsShowcase />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
