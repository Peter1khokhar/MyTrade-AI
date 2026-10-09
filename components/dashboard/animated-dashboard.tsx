'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  LucideIcon,
} from 'lucide-react';
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
} from '@/lib/animations';

// 🎯 Icon name to Component map
const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  target: Target,
  'trending-up': TrendingUp,
  'bar-chart': BarChart3,
};

interface Stat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface AnimatedDashboardProps {
  stats: Stat[];
}

export function AnimatedDashboard({ stats }: AnimatedDashboardProps) {
  return (
    <>
      {/* Stats Grid with Stagger */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          // 🎯 String से Icon component निकालो
          const Icon = ICON_MAP[stat.icon] || Zap;

          return (
            <motion.div
              key={stat.title}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-xl flex items-center justify-center"
                    >
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Signals with Fade In */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">
              🚀 Recent Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No signal yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
                Generate your first AI signal by going to "Signals" page
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}