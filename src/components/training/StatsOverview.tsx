import { motion } from 'framer-motion';
import { TrendingUp, Image, CheckCircle2, AlertTriangle, Target } from 'lucide-react';

interface StatsProps {
  totalPhotos: number;
  confirmedPhotos: number;
  accuracy: number;
  pendingClusters: number;
}

const defaultStats: StatsProps = {
  totalPhotos: 0,
  confirmedPhotos: 0,
  accuracy: 0,
  pendingClusters: 0,
};

export function StatsOverview({ stats = defaultStats }: { stats?: StatsProps }) {
  const statCards = [
    {
      label: 'Training Photos',
      value: stats.totalPhotos.toString(),
      icon: Image,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Confirmed',
      value: stats.confirmedPhotos.toString(),
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Model Accuracy',
      value: `${stats.accuracy}%`,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Pending Clusters',
      value: stats.pendingClusters.toString(),
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
