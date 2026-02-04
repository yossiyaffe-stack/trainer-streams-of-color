import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PaintingUpload } from '@/components/paintings/PaintingUpload';
import { UnifiedGallery } from '@/components/paintings/UnifiedGallery';
import { PaletteGalleryTab } from '@/components/paintings/PaletteGalleryTab';
import { ExportPaintingsBundle } from '@/components/paintings/ExportPaintingsBundle';
import { HubProvider } from '@/contexts/HubContext';
import { Upload, Grid3X3, Library, Star, Settings } from 'lucide-react';

export default function Paintings() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('gallery');
  };

  return (
    <HubProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Sticky Tab Navigation */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b shadow-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Library className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="font-serif text-xl font-bold">Painting Library</h1>
                      <p className="text-xs text-muted-foreground hidden sm:block">AI-powered analysis for your reference collection</p>
                    </div>
                  </div>
                  
                  <TabsList className="grid grid-cols-4 h-12 bg-card border-2 border-primary/30 shadow-lg rounded-xl p-1">
                    <TabsTrigger 
                      value="upload" 
                      className="flex items-center gap-2 px-4 font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Upload</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="gallery" 
                      className="flex items-center gap-2 px-4 font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Gallery</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="palette" 
                      className="flex items-center gap-2 px-4 font-semibold rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                    >
                      <Star className="w-4 h-4" />
                      <span className="hidden sm:inline">Palette</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="export" 
                      className="flex items-center gap-2 px-4 font-semibold rounded-lg data-[state=active]:bg-muted data-[state=active]:shadow-md transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="container mx-auto px-4 py-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
              >
                <TabsContent value="upload" className="mt-0">
                  <PaintingUpload onUploadComplete={handleUploadComplete} />
                </TabsContent>

                <TabsContent value="gallery" className="mt-0">
                  <UnifiedGallery key={refreshKey} />
                </TabsContent>

                <TabsContent value="palette" className="mt-0">
                  <PaletteGalleryTab />
                </TabsContent>

                <TabsContent value="export" className="mt-0">
                  <div className="max-w-2xl">
                    <h2 className="font-serif text-2xl font-bold mb-4">Export & Migration</h2>
                    <p className="text-muted-foreground mb-6">
                      Download all painting library components to migrate to another project.
                    </p>
                    <ExportPaintingsBundle />
                  </div>
                </TabsContent>
              </motion.div>
            </div>
          </Tabs>
        </main>

        <Footer />
      </div>
    </HubProvider>
  );
}