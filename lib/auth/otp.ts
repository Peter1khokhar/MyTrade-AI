import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════
// 🔢 Generate 6-digit OTP
// ═══════════════════════════════════════════════════════════
export function generateOTP(): string {
  // Cryptographically secure random 6-digit number
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
}

// ═══════════════════════════════════════════════════════════
// 🔒 Hash OTP for secure storage
// ═══════════════════════════════════════════════════════════
export function hashOTP(otp: string): string {
  return crypto
    .createHash('sha256')
    .update(otp + process.env.NEXTAUTH_SECRET)
    .digest('hex');
}

// ═══════════════════════════════════════════════════════════
// ✅ Verify OTP
// ═══════════════════════════════════════════════════════════
export function verifyOTP(otp: string, hashedOTP: string): boolean {
  const hashedInput = hashOTP(otp);
  return crypto.timingSafeEqual(
    Buffer.from(hashedInput),
    Buffer.from(hashedOTP)
  );
}

// ═══════════════════════════════════════════════════════════
// 📧 Format OTP for email display
// ═══════════════════════════════════════════════════════════
export function formatOTPForEmail(otp: string): string {
  // 573821 → "5 7 3 8 2 1"
  return otp.split('').join(' ');
}