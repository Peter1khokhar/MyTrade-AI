// ═══════════════════════════════════════════════════════════
// 📧 Brevo Email (HTTP API — xkeysib- key)
// ═══════════════════════════════════════════════════════════

export const resend = {
  emails: {
    send: async (options: {
      from: string;
      to: string;
      subject: string;
      html: string;
    }) => {
      try {
        const apiKey = process.env.BREVO_API_KEY;

        if (!apiKey) {
          console.error('❌ BREVO_API_KEY not set');
          return { error: { message: 'BREVO_API_KEY not set' }, data: null };
        }

        if (!apiKey.startsWith('xkeysib-')) {
          console.error('❌ Invalid key type. Expected xkeysib- API key');
          return { 
            error: { message: 'Invalid API key. Use xkeysib- API key, not xsmtpsib- SMTP key' }, 
            data: null 
          };
        }

        // Parse "Name <email>" format
        const fromMatch = options.from.match(/^(.+?)\s*<(.+?)>$/);
        const fromName = fromMatch ? fromMatch[1].trim() : 'MyTrade AI';
        const fromEmail = fromMatch ? fromMatch[2].trim() : options.from;

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: fromName,
              email: fromEmail,
            },
            to: [{ email: options.to }],
            subject: options.subject,
            htmlContent: options.html,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('❌ Brevo API error:', data);
          return { 
            error: { message: data.message || 'Brevo API error' }, 
            data: null 
          };
        }

        console.log(`✅ Email sent to ${options.to}: ${data.messageId || 'OK'}`);

        return {
          error: null,
          data: { id: data.messageId || `brevo-${Date.now()}` },
        };

      } catch (error: any) {
        console.error('❌ Email send failed:', error.message);
        return { error: { message: error.message }, data: null };
      }
    },
  },
};

export const EMAIL_FROM =
  process.env.EMAIL_FROM || 'MyTrade AI <peterkhokhar51@gmail.com>';