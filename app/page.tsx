import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Zap,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
              💱
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TradeSage AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-700">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by AI • ICT/SMC Strategy
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            AI-Powered Forex Trading{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Signals
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Get high-probability trading signals for Forex, Gold, Silver, Oil, and Copper
            using advanced ICT and SMC strategies. Powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-14 px-8 text-base"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base border-slate-300"
              >
                Login to Account
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              AI-powered analysis
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            all that you want in trading
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional-grade tools और AI analysis एक जगह
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'AI Trading Signals',
              description: 'ICT/SMC strategy पर based high-probability signals',
              color: 'from-blue-500 to-blue-600',
            },
            {
              icon: BarChart3,
              title: 'Multi-Timeframe Analysis',
              description: '15m, 1h, 4h, 1d - सारे timeframes का analysis',
              color: 'from-purple-500 to-purple-600',
            },
            {
              icon: Target,
              title: 'Precise Entry/Exit',
              description: 'Entry, Stop Loss, और 3 Take Profit levels',
              color: 'from-green-500 to-green-600',
            },
            {
              icon: TrendingUp,
              title: 'Large Move Detection',
              description: 'AI detects when 100+ pip moves are possible',
              color: 'from-orange-500 to-orange-600',
            },
            {
              icon: Clock,
              title: 'Best Entry Timing',
              description: 'Killzone analysis - कब enter करना best है',
              color: 'from-pink-500 to-pink-600',
            },
            {
              icon: Shield,
              title: 'Risk Management',
              description: 'Proper R:R ratio और risk factors हर signal में',
              color: 'from-teal-500 to-teal-600',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Instruments Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 lg:p-16 text-white text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Trade All Major Markets
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Forex, Metals, Energy और Industrial - सब एक ही platform पर
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'XAGUSD', 'USOIL', 'XCUUSD'].map((pair) => (
              <span
                key={pair}
                className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-sm font-semibold"
              >
                {pair}
              </span>
            ))}
          </div>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-slate-100 font-semibold h-14 px-8 text-base"
            >
              Start Trading Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 lg:px-6 py-20 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          आज ही शुरू करो
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          Free account बनाओ और AI-powered signals पाओ
        </p>
        <Link href="/register">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-14 px-8 text-base"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                💱
              </div>
              <span className="font-bold text-slate-900">TradeSage AI</span>
            </div>
            <p className="text-sm text-slate-500 text-center">
              © 2026 TradeSage AI • Not financial advice. Do your own research.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}