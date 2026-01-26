import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PaintingUpload } from '@/components/paintings/PaintingUpload';
import { PaintingGrid } from '@/components/paintings/PaintingGrid';
import { MuseumImportTab } from '@/components/hub/paintings/MuseumImportTab';
import { HubProvider } from '@/contexts/HubContext';
import { Upload, Grid3X3, Library, Building2 } from 'lucide-react';

export default function Paintings() {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('gallery');
  };

  return (
    <HubProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Page Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Library className="w-4 h-4" />
                <span className="text-sm font-medium">AI Painting Library</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Painting Reference Library
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Upload paintings and let AI analyze fabrics, colors, silhouettes, and moods 
                using Nechama's methodology. Build your reference library for client consultations.
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 h-14 bg-card border-2 border-primary/20 shadow-lg rounded-xl p-1.5">
                <TabsTrigger 
                  value="upload" 
                  className="flex items-center gap-2 text-base font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </TabsTrigger>
                <TabsTrigger 
                  value="museum" 
                  className="flex items-center gap-2 text-base font-medium rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Building2 className="w-5 h-5" />
                  Museum Import
                </TabsTrigger>
                <TabsTrigger 
                  value="gallery" 
                  className="flex items-center gap-2 text-base font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Grid3X3 className="w-5 h-5" />
                  Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <PaintingUpload onUploadComplete={handleUploadComplete} />
              </TabsContent>

              <TabsContent value="museum">
                <MuseumImportTab />
              </TabsContent>

              <TabsContent value="gallery">
                <PaintingGrid key={refreshKey} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>

        <Footer />
      </div>
    </HubProvider>
  );
}