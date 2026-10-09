interface OTPEmailProps {
  name: string;
  otp: string;
  expiresInMinutes: number;
}

export function generateOTPEmailHTML({
  name,
  otp,
  expiresInMinutes,
}: OTPEmailProps): string {
  const formattedOTP = otp.split('').join(' ');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; width: 56px; height: 56px; background-color: rgba(255,255,255,0.2); border-radius: 14px; line-height: 56px; font-size: 28px; margin-bottom: 16px;">
                💱
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                TradeSage AI
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">
                AI-Powered Forex Trading Signals
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">
                Hi ${name}! 👋
              </h2>
              <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Welcome to TradeSage AI! Please use the verification code below to confirm your email address.
              </p>
              
              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%); border: 2px dashed #a5b4fc; border-radius: 12px; padding: 24px 40px;">
                      <p style="color: #64748b; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px 0;">
                        Verification Code
                      </p>
                      <div style="font-family: 'Courier New', monospace; font-size: 42px; font-weight: 700; color: #1e40af; letter-spacing: 8px; line-height: 1;">
                        ${formattedOTP}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Timer Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px;">
                    <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
                      ⏱️ This code expires in ${expiresInMinutes} minute${expiresInMinutes > 1 ? 's' : ''}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Info -->
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                If you didn't create a TradeSage AI account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2026 TradeSage AI • Not financial advice
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}