import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEASONS, SAMPLE_SUBTYPES } from '@/data/subtypes';
import { Sun, Flower2, Leaf, Snowflake } from 'lucide-react';

const seasonIcons = {
  spring: Flower2,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
};

const seasonPalettes = {
  spring: ['#F4D03F', '#76D7C4', '#F1948A', '#85C1E9', '#F9E79F'],
  summer: ['#AED6F1', '#D7BDE2', '#F5B7B1', '#A9DFBF', '#E8DAEF'],
  autumn: ['#DC7633', '#784212', '#196F3D', '#7B7D7D', '#B7950B'],
  winter: ['#1A5276', '#4A235A', '#1C2833', '#7B241C', '#154360'],
};

export function SeasonsShowcase() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            The Four Seasons
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each season represents a unique harmony of undertones, depth, and clarity. 
            Within each season are subtypes that capture specific color personalities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SEASONS.map((season, index) => {
            const Icon = seasonIcons[season.id];
            const palette = seasonPalettes[season.id];
            const subtypeCount = SAMPLE_SUBTYPES.filter(s => s.season === season.id).length;

            return (
              <motion.div
                key={season.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link 
                  to={`/explore?season=${season.id}`}
                  className={`block p-6 rounded-2xl season-card-${season.id} border border-border/50 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 h-full`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl bg-${season.id}/20`}>
                      <Icon className={`w-6 h-6 text-${season.id}`} style={{ color: palette[0] }} />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold">{season.name}</h3>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-6">
                    {season.description}
                  </p>

                  {/* Color palette preview */}
                  <div className="flex gap-1 mb-4">
                    {palette.map((color, i) => (
                      <div
                        key={i}
                        className="h-8 flex-1 rounded-md first:rounded-l-lg last:rounded-r-lg"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {subtypeCount}+ Subtypes
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
