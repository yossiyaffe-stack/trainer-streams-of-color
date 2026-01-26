import { Link } from 'react-router-dom';
import { Palette } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold">Streams of Color</span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <Link to="/training" className="hover:text-foreground transition-colors">Training</Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            Based on Nechama Yaffe's Kabbalistic Color System
          </p>
        </div>
      </div>
    </footer>
  );
}
