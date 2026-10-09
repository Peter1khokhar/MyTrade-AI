'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { OTPInput } from '@/components/auth/otp-input';
import { useCountdown } from '@/hooks/use-countdown';
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const timer = useCountdown(600);

  // Start timer on mount
  useEffect(() => {
    timer.start(600);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Auto-verify when all 6 digits filled
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !isVerifying && !success) {
      handleVerify(code);
    }
  }, [otp]);

  const handleVerify = async (code: string) => {
    if (!email) {
      setError('Email missing. Please register again.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        toast.error(data.message);
        // Clear OTP on failure
        setOtp(Array(6).fill(''));
        return;
      }

      setSuccess('🎉 Email verified! Redirecting to login...');
      toast.success('Email verified successfully!');

      setTimeout(() => {
        router.push('/login?verified=true');
      }, 1500);
    } catch (err) {
      setError('Verification failed. Please try again.');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.waitTime) {
          setResendCooldown(data.waitTime);
        }
        toast.error(data.message);
        return;
      }

      toast.success('New code sent to your email!');
      setOtp(Array(6).fill(''));
      timer.start(60);
      setResendCooldown(60);
    } catch (err) {
      toast.error('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Email Missing
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Please register again to continue.
          </p>
          <Link href="/register">
            <Button>Go to Register</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
        <CardHeader className="space-y-1 pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 shadow-lg shadow-blue-500/20"
          >
            <Mail className="w-7 h-7 text-white" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            We sent a 6-digit code to
          </CardDescription>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 text-center">
            {email}
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg text-green-700 dark:text-green-400 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* OTP Input */}
          <div className="space-y-3">
            <OTPInput
              value={otp}
              onChange={setOtp}
              disabled={isVerifying || !!success}
            />

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock
                className={cn(
                  'w-4 h-4',
                  timer.isExpired
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              />
              {timer.isExpired ? (
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  Code expired
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-400">
                  Expires in{' '}
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {timer.formatted}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Verifying indicator */}
          {isVerifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <div className="w-full flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Didn't receive?
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={
                isResending || resendCooldown > 0 || timer.isRunning === false && !timer.isExpired
              }
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          <Link href="/register" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Register
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}