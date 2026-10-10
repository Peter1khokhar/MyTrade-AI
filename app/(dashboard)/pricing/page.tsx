'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Sparkles, Crown, Zap, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: 'weekly',
    name: 'Weekly Pro',
    price: 140,
    duration: '7 days',
    period: '/week',
    description: 'Perfect for trying out',
    icon: Zap,
    features: [
      'Unlimited AI signals',
      'All currency pairs & metals',
      'ICT/SMC analysis',
      'Trade journaling',
      'Auto TP/SL monitoring',
      'Email support',
    ],
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: 499,
    duration: '30 days',
    period: '/month',
    description: 'Best value for serious traders',
    icon: Crown,
    features: [
      'Everything in Weekly',
      'Priority AI queue',
      'Advanced analytics',
      'Learning history',
      'Priority support',
      'Save 11% vs weekly',
    ],
    popular: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch current subscription
    fetch('/api/subscription/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubscription(data.subscription);
        }
      })
      .catch(console.error);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      // 1. Create order
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'MyTrade AI',
        description: data.plan.name,
        order_id: data.order.id,
        prefill: {
          name: data.user.name,
          email: data.user.email,
        },
        theme: {
          color: '#1E40AF',
        },
        handler: async function (response: any) {
          // 3. Verify payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            toast.success(verifyData.message);
            setTimeout(() => {
              router.push('/dashboard');
              router.refresh();
            }, 1500);
          } else {
            toast.error(verifyData.message);
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setSelectedPlan(null);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed, try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Simple pricing, no surprises
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
          Upgrade to{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pro
          </span>
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Unlock unlimited AI signals and advanced features.
        </p>

        {/* Current Plan Banner */}
        {subscription && subscription.plan !== 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-300">
                Active Plan: {subscription.plan}
              </span>
            </div>
            <span className="text-sm text-green-700 dark:text-green-400">
              • {subscription.daysRemaining} days left
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Plans Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = subscription?.plan === plan.id;

          return (
            <motion.div
              key={plan.id}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                    ⭐ Most Popular
                  </div>
                </div>
              )}

              <Card
                className={cn(
                  'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden',
                  plan.popular &&
                    'border-2 border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/10'
                )}
              >
                <CardContent className="p-6 lg:p-8">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center',
                        plan.popular
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                          : 'bg-slate-100 dark:bg-slate-800'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          plan.popular
                            ? 'text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        ₹{plan.price}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {plan.period}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {plan.duration} access
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoading || isCurrentPlan}
                      className={cn(
                        'w-full h-11 font-semibold rounded-xl',
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                      )}
                    >
                      {isLoading && selectedPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        '✓ Current Plan'
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Upgrade Now
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Free Trial Info */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              New here? Get 2 days Free Trial
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              No credit card required
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}