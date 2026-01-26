import { motion } from 'framer-motion';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { SubtypeExplorer } from '@/components/explore/SubtypeExplorer';

export default function Explore() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Explore Color Subtypes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the 40+ unique color subtypes across the four seasons. 
              Each subtype has its own palette, fabrics, and style recommendations.
            </p>
          </motion.div>

          {/* Subtype Explorer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SubtypeExplorer />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
