// import { auth } from '@/lib/auth/auth';
import { auth } from '@/lib/auth/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Zap, Target, BarChart3 } from 'lucide-react';
import { MarketTicker } from '@/components/dashboard/market-ticker';

export default async function DashboardPage() {
  const session = await auth();

  const stats = [
    { title: 'Active Signals', value: '0', icon: Zap, color: 'blue' },
    { title: 'Win Rate', value: '--', icon: Target, color: 'green' },
    { title: 'Total Trades', value: '0', icon: TrendingUp, color: 'purple' },
    { title: 'Watchlist', value: '3', icon: BarChart3, color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          🎉 Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-slate-600 mt-1">
          आज क्या trade करना है?
        </p>
      </div>

      {/* 🆕 Market Ticker */}
<MarketTicker />


      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Signal Placeholder */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">🚀 Recent Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              अभी कोई signal नहीं है
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              अपना पहला AI signal generate करने के लिए "Signals" page पर जाओ
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}