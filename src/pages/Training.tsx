import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PhotoUpload } from '@/components/training/PhotoUpload';
import { AnalysisResult } from '@/components/training/AnalysisResult';
import { StatsOverview } from '@/components/training/StatsOverview';
import { BulkTrainingTab } from '@/components/training/BulkTrainingTab';
import { PhotoGridView } from '@/components/training/PhotoGridView';
import { ProgressDashboard } from '@/components/training/ProgressDashboard';
import { BatchReanalysis } from '@/components/training/BatchReanalysis';
import { SubtypeManager } from '@/components/training/SubtypeManager';
import { HuggingFaceImport } from '@/components/training/HuggingFaceImport';
import { SAMPLE_SUBTYPES } from '@/data/subtypes';
import { BulkPhoto } from '@/types/training';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  CheckSquare, 
  Sparkles, 
  BookOpen, 
  BarChart3,
  Play,
  Loader2,
  Table2,
  LayoutGrid,
  FlaskConical,
  Palette,
  Database
} from 'lucide-react';

export default function Training() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Shared photo state for grid view and re-analysis
  const [trainingPhotos, setTrainingPhotos] = useState<BulkPhoto[]>([]);
  
  const handleUpdatePhoto = (id: string, updates: Partial<BulkPhoto>) => {
    setTrainingPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };
  
  const handleBatchAction = (action: 'confirm' | 'analyze', ids: string[]) => {
    if (action === 'confirm') {
      setTrainingPhotos(prev => prev.map(p => 
        ids.includes(p.id) ? { ...p, status: 'confirmed', confirmedSubtype: p.aiPrediction } : p
      ));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPhoto) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis - in production this would call the edge function
    setTimeout(() => {
      setAnalysisResult({
        predictions: [
          { subtype: SAMPLE_SUBTYPES[0], confidence: 85 },
          { subtype: SAMPLE_SUBTYPES[2], confidence: 72 },
          { subtype: SAMPLE_SUBTYPES[4], confidence: 58 },
        ],
        extractedFeatures: {
          skinUndertone: 'warm',
          skinDepth: 'light',
          eyeColor: 'Blue-Green',
          hairColor: 'Golden Blonde',
          contrastLevel: 'medium',
        },
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Faces
              
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Upload photos, review AI predictions, and correct results to improve the model's accuracy.
            </p>
          </motion.div>

          {/* Import Datasets Big Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <Button
              onClick={() => setActiveTab('import')}
              size="lg"
              className="w-full md:w-auto h-16 px-8 text-lg gap-3 bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Database className="w-6 h-6" />
              Import Datasets from Hugging Face
            </Button>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <StatsOverview 
              stats={{
                totalPhotos: 142,
                confirmedPhotos: 98,
                accuracy: 87,
                pendingClusters: 3,
              }}
            />
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
              <TabsTrigger value="analyze" className="gap-2 data-[state=active]:bg-background">
                <Camera className="w-4 h-4" />
                Analyze
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-2 data-[state=active]:bg-background">
                <Table2 className="w-4 h-4" />
                Bulk Training
              </TabsTrigger>
              <TabsTrigger value="grid" className="gap-2 data-[state=active]:bg-background">
                <LayoutGrid className="w-4 h-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2 data-[state=active]:bg-background">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="reanalysis" className="gap-2 data-[state=active]:bg-background">
                <FlaskConical className="w-4 h-4" />
                Re-Analysis
              </TabsTrigger>
              <TabsTrigger value="subtypes" className="gap-2 data-[state=active]:bg-background">
                <Palette className="w-4 h-4" />
                Manage Subtypes
              </TabsTrigger>
              <TabsTrigger value="import" className="gap-2 data-[state=active]:bg-background">
                <Database className="w-4 h-4" />
                Import Datasets
              </TabsTrigger>
            </TabsList>

            {/* Analyze Photo Tab */}
            <TabsContent value="analyze" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-semibold">Upload Photo</h2>
                  <PhotoUpload 
                    selectedPhoto={selectedPhoto}
                    onPhotoSelect={setSelectedPhoto}
                    isAnalyzing={isAnalyzing}
                  />
                  {selectedPhoto && !analysisResult && (
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing}
                      className="w-full"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Analysis
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-semibold">Analysis Results</h2>
                  {analysisResult ? (
                    <AnalysisResult 
                      predictions={analysisResult.predictions}
                      extractedFeatures={analysisResult.extractedFeatures}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 rounded-2xl bg-muted/30 border-2 border-dashed border-border">
                      <p className="text-muted-foreground">Upload a photo to see analysis results</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Bulk Training Tab */}
            <TabsContent value="bulk" className="space-y-6">
              <BulkTrainingTab />
            </TabsContent>

            {/* Review Queue Tab */}
            <TabsContent value="review" className="space-y-6">
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">
                  All analyzed photos have been reviewed. Great work!
                </p>
              </div>
            </TabsContent>

            {/* New Subtypes Tab */}
            <TabsContent value="clusters" className="space-y-6">
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">No Pending Clusters</h3>
                <p className="text-muted-foreground">
                  When photos don't match existing subtypes, clusters will appear here for review.
                </p>
              </div>
            </TabsContent>

            {/* Manage Subtypes Tab */}
            <TabsContent value="subtypes" className="space-y-6">
              <SubtypeManager />
            </TabsContent>

            {/* Grid View Tab */}
            <TabsContent value="grid" className="space-y-6">
              <PhotoGridView 
                photos={trainingPhotos}
                onUpdatePhoto={handleUpdatePhoto}
                onBatchAction={handleBatchAction}
              />
            </TabsContent>

            {/* Metrics/Dashboard Tab */}
            <TabsContent value="metrics" className="space-y-6">
              <ProgressDashboard photos={trainingPhotos} subtypes={SAMPLE_SUBTYPES} />
            </TabsContent>

            {/* Re-Analysis Tab */}
            <TabsContent value="reanalysis" className="space-y-6">
              <BatchReanalysis 
                photos={trainingPhotos} 
                subtypes={SAMPLE_SUBTYPES}
                modelVersion={{ version: '1.0', trainedOn: trainingPhotos.filter(p => p.status === 'confirmed').length }}
              />
            </TabsContent>

            {/* Import from Hugging Face Tab */}
            <TabsContent value="import" className="space-y-6">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-semibold mb-2">Import from Hugging Face</h2>
                <p className="text-muted-foreground">
                  Browse and import face images from popular datasets like CelebA-HQ, FFHQ, and LFW.
                </p>
              </div>
              <HuggingFaceImport />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
