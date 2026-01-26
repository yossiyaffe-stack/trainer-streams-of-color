import { motion } from 'framer-motion';
import { HubProvider, useHub } from '@/contexts/HubContext';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { HubHeader } from '@/components/hub/HubHeader';
import { HubModeSelector } from '@/components/hub/HubModeSelector';
import { HubTabNavigation } from '@/components/hub/HubTabNavigation';
import { HubProgressBar } from '@/components/hub/HubProgressBar';

// Photo tabs
import { PhotoUploadTab } from '@/components/hub/photos/PhotoUploadTab';
import { PhotoGridTab } from '@/components/hub/photos/PhotoGridTab';
import { PhotoProgressTab } from '@/components/hub/photos/PhotoProgressTab';

// Painting tabs
import { PaintingUploadTab } from '@/components/hub/paintings/PaintingUploadTab';
import { PaintingGridTab } from '@/components/hub/paintings/PaintingGridTab';
import { PaintingListTab } from '@/components/hub/paintings/PaintingListTab';
import { PaintingBySubtypeTab } from '@/components/hub/paintings/PaintingBySubtypeTab';

function PhotoSection() {
  const { activeTab } = useHub();

  return (
    <>
      {activeTab === 'upload' && <PhotoUploadTab />}
      {activeTab === 'grid' && <PhotoGridTab />}
      {activeTab === 'table' && <PhotoGridTab />}
      {activeTab === 'progress' && <PhotoProgressTab />}
      {activeTab === 'reanalysis' && <PhotoProgressTab />}
    </>
  );
}

function PaintingSection() {
  const { activeTab } = useHub();

  return (
    <>
      {activeTab === 'upload' && <PaintingUploadTab />}
      {activeTab === 'grid' && <PaintingGridTab />}
      {activeTab === 'list' && <PaintingListTab />}
      {activeTab === 'bySubtype' && <PaintingBySubtypeTab />}
    </>
  );
}

function HubContent() {
  const { mode, photoAnalyzing, paintingAnalyzing, photoProgress, paintingProgress } = useHub();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col pt-16">
        <HubHeader />
        <HubModeSelector />
        <HubTabNavigation />
        
        <div className="flex-1 overflow-hidden">
          {mode === 'photos' ? <PhotoSection /> : <PaintingSection />}
        </div>

        {/* Global Progress Bars */}
        {photoAnalyzing && (
          <HubProgressBar 
            current={photoProgress.current} 
            total={photoProgress.total} 
            label="Analyzing photos..." 
            variant="primary" 
          />
        )}
        {paintingAnalyzing && (
          <HubProgressBar 
            current={paintingProgress.current} 
            total={paintingProgress.total} 
            label="Analyzing paintings..." 
            variant="accent" 
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function Hub() {
  return (
    <HubProvider>
      <HubContent />
    </HubProvider>
  );
}
