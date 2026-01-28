import { Header } from '@/components/landing/Header';
import { SubtypeManager } from '@/components/training/SubtypeManager';

export default function Subtypes() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-6 pt-24 pb-12">
        <SubtypeManager />
      </main>
    </div>
  );
}
