import { motion } from 'framer-motion';
import { Camera, Brain, Palette, Sparkles, Users, LineChart } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Photo Analysis',
    description: 'Upload photos to extract skin undertone, eye color, hair color, and contrast levels using advanced AI vision.',
  },
  {
    icon: Brain,
    title: 'AI Learning',
    description: 'The system learns from expert corrections, continuously improving its accuracy and discovering new patterns.',
  },
  {
    icon: Palette,
    title: '40+ Subtypes',
    description: 'Match against over 40 carefully curated subtypes, each with complete palette, fabric, and style definitions.',
  },
  {
    icon: Sparkles,
    title: 'New Discovery',
    description: 'Automatically detect and create new subtypes when unique color patterns emerge that don\'t fit existing categories.',
  },
  {
    icon: Users,
    title: 'Expert Review',
    description: 'All analyses are reviewed by trained color consultants before results are finalized.',
  },
  {
    icon: LineChart,
    title: 'Accuracy Tracking',
    description: 'Monitor model performance over time with detailed metrics and confidence scoring.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-card">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Training System
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-2 mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A sophisticated AI system that learns the art of color analysis from expert input.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
